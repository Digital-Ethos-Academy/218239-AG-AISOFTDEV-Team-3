import streamlit as st
import requests

st.title("Conversational Agent UI")


# Initialize session_id in Streamlit session state
if "session_id" not in st.session_state:
    st.session_state["session_id"] = None

user_question = st.text_input("Enter your question:")

if st.button("Ask Agent"):
    if user_question.strip():
        try:
            payload = {"question": user_question}
            # Include session_id if available
            if st.session_state["session_id"]:
                payload["session_id"] = st.session_state["session_id"]
            response = requests.post(
                "http://127.0.0.1:8000/stateful_chat",
                json=payload
            )
            if response.status_code == 200:
                data = response.json()
                agent_answer = data.get("answer", "No answer returned.")
                session_id = data.get("session_id")
                if session_id:
                    st.session_state["session_id"] = session_id
                st.success(f"Agent: {agent_answer}")
            else:
                st.error(f"Error: {response.status_code} - {response.text}")
        except Exception as e:
            st.error(f"Request failed: {e}")
    else:
        st.warning("Please enter a question before submitting.")
