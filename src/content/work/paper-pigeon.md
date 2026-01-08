---
title: Paper Pigeon
publishDate: 2024-11-15 00:00:00
img: /assets/PaperPigeonDemo.gif
img_alt: Paper Pigeon interactive 3D visualization of research network
description: |
  A 3D research visualization platform that maps the University of Washington Allen School's research output. Explore researcher networks, discover papers, and experience data through immersive VR—powered by React, AWS Bedrock AI, and WebGL.
tags:
  - React 19
  - TypeScript
  - 3D Visualization
  - AWS
  - AI/RAG
---

## 🌟 Overview

Paper Pigeon transforms research discovery into an interactive experience. Navigate a force-directed graph of researchers, labs, and papers. Upload your resume to find collaborators. Ask questions about papers with AI-powered answers. Step into VR to walk through your research network.

## ✨ Core Features

**Interactive 3D Graph Visualization**  
Force-directed graph powered by 3d-force-graph and Three.js. Click, drag, and explore—every researcher and paper is just a gesture away. Pre-computed static cache ensures instant loads without database queries.

**Resume Semantic Matching**  
Upload your resume and let AWS Bedrock AI identify researchers whose work aligns with your experience and interests. Intelligent recommendations drive discovery.

**AI-Powered Research Chat**  
Ask questions about any paper and get intelligent answers with direct citations. Built on AWS Bedrock's retrieval-augmented generation for accurate, grounded responses.

**Immersive VR Experience**  
Put on a headset and walk through your research network in full 3D space. A-Frame VR transforms the graph into an explorable virtual environment.

**Researcher Profiles & Paper Search**  
Dive into researcher bios, publication history, lab affiliations, and topic tags. Everything connected, instantly searchable.

## 🏗️ Architecture

![Paper Pigeon Architecture](/assets/PaperPigeonFlowchart.png)

The system employs a serverless, distributed architecture optimized for instant load times and cost efficiency:

- **Frontend**: Vite + React 19 + TypeScript
- **3D Engine**: WebGL with Three.js and 3d-force-graph
- **Backend**: Flask API on Vercel Serverless Functions
- **AI**: AWS Bedrock for semantic search and resume matching
- **Data**: DynamoDB for relationships, S3 for PDFs with secure presigned URLs
- **Cache**: Scheduled Cloudflare Workers rebuild optimized JSON graph daily
- **Deployment**: Full CI/CD pipeline with Playwright testing

## 🎯 What It Does

Paper Pigeon answers a critical question: "Who is working on what, and who should I connect with?" It synthesizes scattered research outputs into an explorable map—making discovery intuitive, visual, and serendipitous.
