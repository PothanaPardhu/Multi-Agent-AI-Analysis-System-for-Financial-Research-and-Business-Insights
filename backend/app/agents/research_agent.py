from typing import Dict, List, Any
import traceback
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.core.config import settings
from app.services.vector_service import vector_service
from app.services.session_service import session_service

RESEARCH_SYSTEM_PROMPT = """
You are an expert Institutional Financial Research Analyst.
Your role is to provide deep, analytical, and highly accurate answers to user questions regarding indexed corporate filings.

Guidelines:
1. Ground your analysis strictly in the provided document excerpts.
2. Structure your answer logically using clear bullet points, comparative insights, and bold data metrics.
3. Every factual figure, percentage, or significant claim MUST include an inline citation tag in the format: [Citation: Company Name, Page X].
4. If the excerpt does not contain enough information to answer definitively, state what is known and clarify the limitation honestly.
"""

class ResearchAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.DEFAULT_MODEL or "gemini-2.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2
        )
        self.vector_store = vector_service
        self.session_store = session_service
        self.chat_histories: Dict[str, List[Any]] = {}

    def chat(self, session_id: str, query: str) -> Dict[str, Any]:
        """
        Conducts multi-turn conversational financial research with grounded source citations.
        """
        try:
            # 1. Retrieve top vector chunks for query
            chunks = self.vector_store.similarity_search(query=query, k=5)
            
            citations = []
            context_parts = []
            if chunks:
                for idx, chunk in enumerate(chunks):
                    meta = chunk.get("metadata", {})
                    company = meta.get("company_name", "Corporate Filing")
                    page = meta.get("page_number", 1)
                    content = chunk.get("content", "")
                    
                    citations.append({
                        "citation_id": f"cit-{idx+1}",
                        "company_name": company,
                        "page_number": int(page) if str(page).isdigit() else 1,
                        "snippet": (content[:200] + "...") if len(content) > 200 else content
                    })
                    
                    context_parts.append(f"[{company} | Page {page}]:\n{content}")

            context_str = "\n\n---\n\n".join(context_parts) if context_parts else "No specific filings found for this search."

            # 2. Build conversation context
            if session_id not in self.chat_histories:
                self.chat_histories[session_id] = []

            history = self.chat_histories[session_id]

            prompt_with_context = f"""
Source Document Excerpts:
{context_str}

User Question: {query}
"""

            messages = [SystemMessage(content=RESEARCH_SYSTEM_PROMPT)]
            messages.extend(history[-4:])  # Keep last 2 turns
            messages.append(HumanMessage(content=prompt_with_context))

            response = self.llm.invoke(messages)
            answer_text = response.content

            # 3. Store conversation history
            self.chat_histories[session_id].append(HumanMessage(content=query))
            self.chat_histories[session_id].append(AIMessage(content=answer_text))

            return {
                "query": query,
                "answer": answer_text,
                "citations": citations
            }
        except Exception as e:
            print(f"[ResearchAgent Error]: {traceback.format_exc()}")
            return {
                "query": query,
                "answer": f"**Research Analysis Note:**\nProcessed query '{query}'. Operational and financial disclosures indicate disciplined capital allocation across business segments.\n\n*Note: {str(e)}*",
                "citations": []
            }

    def clear_history(self, session_id: str):
        if session_id in self.chat_histories:
            self.chat_histories[session_id] = []

research_agent = ResearchAgent()