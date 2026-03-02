"""Seed default prompt templates into the database."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.template import PromptTemplate

TEMPLATES = [
    {
        "title": "Explain Like I'm 5",
        "description": "Get a simple explanation of any complex topic",
        "template": "Explain the following topic in simple terms that a 5-year-old could understand:\n\n{{topic}}",
        "category": "learning",
    },
    {
        "title": "Code Review",
        "description": "Get a thorough review of your code",
        "template": "Review the following code for bugs, performance issues, and best practices. Provide specific suggestions:\n\n```\n{{code}}\n```",
        "category": "coding",
    },
    {
        "title": "Debug Helper",
        "description": "Help debug an error or unexpected behavior",
        "template": "I'm getting the following error:\n\n```\n{{error}}\n```\n\nHere's the relevant code:\n\n```\n{{code}}\n```\n\nHelp me understand why this is happening and how to fix it.",
        "category": "coding",
    },
    {
        "title": "Write Unit Tests",
        "description": "Generate unit tests for your code",
        "template": "Write comprehensive unit tests for the following code. Use appropriate testing frameworks and cover edge cases:\n\n```\n{{code}}\n```",
        "category": "coding",
    },
    {
        "title": "Summarize Text",
        "description": "Get a concise summary of any text",
        "template": "Summarize the following text in {{length}} (bullet points/paragraph/key takeaways):\n\n{{text}}",
        "category": "writing",
    },
    {
        "title": "Improve Writing",
        "description": "Enhance clarity and style of your writing",
        "template": "Improve the following text for clarity, grammar, and engagement while keeping the same tone:\n\n{{text}}",
        "category": "writing",
    },
    {
        "title": "Email Draft",
        "description": "Draft a professional email",
        "template": "Draft a professional email with the following details:\n- Recipient: {{recipient}}\n- Purpose: {{purpose}}\n- Key points: {{points}}\n- Tone: {{tone}}",
        "category": "writing",
    },
    {
        "title": "Data Analysis",
        "description": "Analyze data and extract insights",
        "template": "Analyze the following data and provide key insights, trends, and actionable recommendations:\n\n{{data}}",
        "category": "analysis",
    },
    {
        "title": "Pros and Cons",
        "description": "Compare options with structured analysis",
        "template": "Create a detailed pros and cons analysis for:\n\n{{topic}}\n\nConsider factors like cost, time, feasibility, and long-term impact.",
        "category": "analysis",
    },
    {
        "title": "Research Summary",
        "description": "Summarize research on a topic",
        "template": "Provide a comprehensive research summary on:\n\n{{topic}}\n\nInclude:\n- Key findings\n- Current state of the field\n- Major debates or open questions\n- Relevant statistics or data",
        "category": "research",
    },
    {
        "title": "Study Guide",
        "description": "Create a study guide for a topic",
        "template": "Create a comprehensive study guide for:\n\n{{topic}}\n\nInclude:\n- Key concepts and definitions\n- Important formulas/principles\n- Practice questions\n- Common misconceptions",
        "category": "learning",
    },
    {
        "title": "API Documentation",
        "description": "Generate API documentation for your endpoints",
        "template": "Generate clear API documentation for the following endpoint:\n\n```\n{{code}}\n```\n\nInclude: description, parameters, request/response examples, error codes.",
        "category": "coding",
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for tmpl in TEMPLATES:
            template = PromptTemplate(
                title=tmpl["title"],
                description=tmpl["description"],
                template=tmpl["template"],
                category=tmpl["category"],
                is_system=True,
            )
            session.add(template)
        await session.commit()
        print(f"Seeded {len(TEMPLATES)} templates")


if __name__ == "__main__":
    asyncio.run(seed())
