# Haq (हक़) — Project Overview

> **"हक़"** (pronounced *haaq*) is the Urdu/Hindi word for **right** or **entitlement**.

---

## What Is This Project?

**Haq** is an AI-powered web application built to help **Delhi's workers** — especially daily-wage laborers, migrant workers, and construction workers — understand their **labour rights**, check their **minimum wage**, and **draft formal complaints** against violations.

It was built for the **GDG Cloud New Delhi × Elastic "Build With AI" Buildathon** (Theme 2: *Migrant Worker & Labour Rights Agent — Human Impact*).

---

## Who Is It For?

The target users are:
- Daily-wage workers (construction, domestic, factory)
- Migrant workers who moved to Delhi from other states
- Workers with **little formal schooling** or English literacy
- People who don't trust or know how to approach officials

This is why the app defaults to **Hindi**, uses large readable text, and gives answers in **plain, simple language** — the way a trusted friend would explain things, not how a lawyer would.

---

## What Can It Do?

| Feature | Description |
|---|---|
| 💬 **AI Chat Agent** | Ask anything about labour rights in Hindi or English. The AI answers, cites the relevant law, and tells you the exact next step. |
| 🔎 **Live Web Search** | Uses Google Search grounding via Gemini, so answers cite real, current web sources. |
| 💰 **Minimum Wage Calculator** | Pick your work category (unskilled/skilled/etc.) and see what Delhi law guarantees you. Enter your actual pay to see your shortfall. |
| 📝 **Complaint Drafter** | Fill in a short form → get a complete, formal, ready-to-submit complaint letter addressed to the correct authority. Download it as a `.txt` file. |
| ☎️ **Helplines & Offices** | One-tap access to Shramik Helpline (155214), e-Shram (14434), Delhi BOCW board, and more. |
| 🌐 **Hindi-First UI** | Full bilingual (Hindi/English) interface — every label, prompt, and error message. |
| 📱 **PWA (Installable App)** | Can be installed on Android/iOS home screen. Works offline for the app shell. |
| 🔒 **Privacy-First** | No database, no user accounts, no storage of anything typed. The API key never leaves the server. |

---

## The Problem It Solves

Delhi has millions of unorganised-sector workers. Many:
- Don't know their legal minimum wage
- Are paid less than the law requires (often by contractors)
- Don't know how to file a complaint or which office to go to
- Don't speak English well enough to navigate government websites
- Don't trust that help is available

**Haq** gives them an accessible, in-their-language entry point that immediately tells them their rights, names the law, and gives them something concrete to do — whether that's calling a helpline or printing a complaint letter.

---

## Key Design Principles

1. **Plain language first** — answers are capped at ~180 words, use bullet points, no legalese
2. **Always actionable** — every answer ends with a concrete next step
3. **Cite the law** — names the actual statute (e.g. "Code on Wages, 2019") so it feels authoritative
4. **Safety first** — injury/emergency situations always prioritise calling 112 before anything else
5. **Privacy** — never asks for Aadhaar, bank, or ID numbers; tells users nothing is saved

---

## Where It Lives

The app runs at `http://localhost:3000` in development. It can be deployed to Vercel (free tier) with just a `GEMINI_API_KEY` environment variable.
