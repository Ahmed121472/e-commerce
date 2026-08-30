# Dual-Journey E-Commerce Platform

> **An In-Situ E-Commerce Architecture without a Detached Admin Panel**

---

## Executive Summary

Traditional e-commerce platforms create a fragmented experience by separating customer-facing storefronts from complex, disconnected backend admin panels. This platform eliminates the separate admin panel entirely in favor of an **In-Situ Dual-Journey Architecture**.

The system operates as a unified, role-aware application serving two primary journeys:
1. **Customer Journey**: A fast, responsive shopping storefront featuring intuitive catalog discovery, visual product galleries, variant customization, persistent cart management, and seamless checkout.
2. **Seller / Merchant Journey**: Direct, on-canvas management embedded within the live storefront. Authenticated sellers can visually edit product details, import dropshipped goods with real-time margin formulas, adjust pricing, toggle inventory status, and process orders in place.

---

## Core Concept & Value Proposition

* **Zero Admin Panel Overhead**: Sellers manage inventory, pricing, and descriptions directly where customers see them.
* **Hybrid Product Sourcing**: Seamless support for both custom merchant inventory and 1-click dropshipped supplier catalog imports.
* **Real-Time Margin Controls**: Automated price markup calculations based on supplier base cost, shipping fees, and target profit margins.
* **Unified Context & Rapid Iteration**: What you see is what you sell (WYSIWYS). Modifications are instantly visible in customer perspective with zero context switching.

---

## Summary of Requirements

### Functional Requirements (FR)

| ID | Domain | Description |
| :--- | :--- | :--- |
| **FR-1** | **Storefront & Catalog** | Dynamic catalog with multi-criteria filtering, search, category tags, and responsive product grids. |
| **FR-2** | **In-Situ Product Editing** | Click-to-edit inline text, markdown descriptions, image galleries, and pricing directly on the live store canvas. |
| **FR-3** | **Dropshipping Integration** | 1-Click supplier catalog import (AliExpress/CJ/Printful formats), automated specs ingestion, and markup margin calculation. |
| **FR-4** | **Cart & Checkout** | Persistent slide-out cart drawer, dynamic tax/shipping calculation, and multi-step guest/member checkout. |
| **FR-5** | **Order & Fulfillment** | In-place seller order dashboard for dispatch status updates, tracking numbers, and dropship webhook triggers. |
| **FR-6** | **Role & Auth Management** | Secure seller mode toggle with granular permission enforcement on mutations. |

### Non-Functional Requirements (NFR)

| ID | Domain | Target Metric / Standard |
| :--- | :--- | :--- |
| **NFR-1** | **Performance** | Sub-1.5s initial page load; sub-100ms client state transitions for inline editing. |
| **NFR-2** | **Security** | Role-based authorization on all mutation APIs; server-side isolation of payment & supplier secrets. |
| **NFR-3** | **Usability & Design** | WCAG 2.1 AA compliant; mobile-first fluid layout with min 44px touch targets; zero clutter UI. |
| **NFR-4** | **Data Integrity** | Real-time optimistic UI updates backed by persistent storage and validation on inputs. |

---

## Documentation Links

* 📐 **[Architectural Diagrams](./ARCHITECTURE.md)**: Detailed system architecture, component hierarchy, role-based state flow, dropshipping data pipeline, and data models.
* 📋 **[User Stories & Acceptance Criteria](./USER_STORIES.md)**: Comprehensive user stories covering customer flows, seller in-situ workflows, dropship imports, and fulfillment.

---

## Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (animation)
* **Icons**: Lucide React
* **Backend / API**: Express & Node.js
* **Persistence**: Client state synchronization with Firestore / Cloud-ready schemas
* **Build Tooling**: Vite 6, tsx, esbuild
