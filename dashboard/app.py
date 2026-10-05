import os
from collections import Counter

import pandas as pd
import plotly.express as px
import requests
import streamlit as st

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.set_page_config(page_title="CareerPilot Analytics", page_icon="📊", layout="wide")


@st.cache_data(ttl=60)
def load_data():
    resp = requests.get(f"{API_URL}/api/analytics", timeout=30)
    resp.raise_for_status()
    return resp.json()


st.title("CareerPilot AI — Analytics")
st.caption("Which roles fit you best, and which skills keep coming up missing.")

if st.button("Refresh data"):
    load_data.clear()

try:
    rows = load_data()
except Exception as exc:
    st.error(f"Couldn't reach the API at {API_URL}. Is the backend running? Details: {exc}")
    st.stop()

if not rows:
    st.info("No analyses yet. Run one in the web app (http://localhost:5173) first, then click Refresh data.")
    st.stop()

df = pd.DataFrame(rows)
df["created_at"] = pd.to_datetime(df["created_at"])

# KPI row
best = df.loc[df["match_score"].idxmax()]
k1, k2, k3, k4 = st.columns(4)
k1.metric("Analyses", len(df))
k2.metric("Average match", f"{df['match_score'].mean():.0f}")
k3.metric("Best match", f"{best['match_score']:.0f}")
k4.metric("Best-fit role", best["job_title"])

left, right = st.columns(2)

with left:
    st.subheader("Match score over time")
    fig = px.line(df, x="created_at", y="match_score", markers=True, hover_data=["job_title", "company"])
    fig.update_yaxes(range=[0, 100], title="Match score")
    fig.update_xaxes(title="")
    st.plotly_chart(fig, use_container_width=True)

with right:
    st.subheader("Most-missed skills — learn these next")
    counts = Counter(skill for skills in df["missing_skills"] for skill in skills).most_common(10)
    if counts:
        missing = pd.DataFrame(counts, columns=["skill", "count"])
        fig2 = px.bar(missing, x="count", y="skill", orientation="h")
        fig2.update_layout(yaxis={"categoryorder": "total ascending", "title": ""}, xaxis_title="Job posts missing it")
        st.plotly_chart(fig2, use_container_width=True)
    else:
        st.success("No missing skills recorded yet.")

st.subheader("All analyses")
table = df[["created_at", "job_title", "company", "match_score", "keyword_score", "semantic_score"]]
st.dataframe(table.sort_values("created_at", ascending=False), use_container_width=True, hide_index=True)
