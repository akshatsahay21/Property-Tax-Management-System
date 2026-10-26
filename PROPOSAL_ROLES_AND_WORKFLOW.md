# 🏛️ Architecture Proposal: Multi-Tier Role Hierarchy & Municipal Workflow Engine

> **Document Version:** 1.0.0  
> **Target System:** Property Tax Management System  
> **Status:** Proposed / Blueprint for Implementation  

---

## 📌 Executive Summary

This document details the architectural expansion of the **Property Tax Management System** from a basic two-tier inspection tool into an enterprise-grade **Municipal Corporation / Urban Local Body (ULB)** workflow application.

By introducing real-world administrative and revenue roles—**SI**, **DI**, **AO**, **AMC**, **HOD**, **Billing Operator**, and **Bill Approver**—the system incorporates **Separation of Duties (SoD)**, financial audit compliance, maker-checker authorization chains, and an automated tax billing engine.

---

## 👥 Municipal Role Hierarchy & Mapping

The proposed roles accurately reflect the administrative structure of municipal revenue departments:

| Role Code | Full Title | Departmental Level | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **`SI`** | **Sub Inspector / Section Inspector** | Field Survey Level | • Conducts physical site inspections.<br>• Records property dimensions, usage type (Residential / Commercial / Industrial).<br>• Captures geo-tagged site photographs.<br>• Submits initial assessment survey into the system. |
| **`DI`** | **Deputy Inspector / District Inspector** | Field Supervision Level | • First-line supervisor of SIs within the assigned ward/district.<br>• Verifies site measurements against land records/GIS maps.<br>• Validates survey completeness and image quality.<br>• Approves forward or rejects back to SI with specific inspection queries. |
| **`AO`** | **Assessment Officer / Administrative Officer** | Valuation & Tax Calculation Level | • Computes the **Annual Rateable Value (ARV)** / Unit Area rate.<br>• Applies statutory depreciation, rebate slabs, or commercial surcharges.<br>• Sets the base tax determination for the property.<br>• Forwards validated tax assessment for executive sanction. |
| **`AMC`** | **Assistant / Additional Municipal Commissioner** | Zonal Executive Level | • Executive authority for the municipal zone.<br>• Reviews and sanctions standard property tax determinations.<br>• Evaluates homeowner tax objections or boundary disputes.<br>• Automatically escalates high-value or disputed files to HOD. |
| **`HOD`** | **Head of Department (Assessor & Collector of Taxes)** | Apex Municipal Authority | • Highest departmental approval authority.<br>• Approves high-value commercial properties, institutional assets, or assessments exceeding monetary thresholds.<br>• Authorizes special penalty waivers or statutory exemptions. |
| **`BILLING_OPERATOR`** | **Billing Operator / Tax Clerk** | Revenue Operations Level | • Accesses all sanctioned property assessments.<br>• Generates formal Property Tax Demand Notices & Bills.<br>• Configures payment installment schedules, rebate deadlines, and interest charges. |
| **`BILL_APPROVER`** | **Bill Approver / Revenue Superintendent** | Financial Audit Level | • Independent financial maker-checker check.<br>• Audits generated bills against sanctioned assessment orders.<br>• Authorizes final bill publication for taxpayer portals and payment gateways. |

---

## 🔄 End-to-End Workflow Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE 1: FIELD SURVEY & VERIFICATION                 │
└────────────────────────────────────────────────────────────────────────┘
        [ SI: Sub Inspector ]
                 │
                 │ (Conducts field survey, captures photos, inputs dimensions)
                 ▼
          [ Status: PENDING_DI ]
                 │
                 ▼
        [ DI: District Inspector ]
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
  [ REJECT_TO_SI ]    [ FORWARD_TO_AO ]
       │                   │
       ▼                   ▼
 [ Status: DRAFT_SI ]  [ Status: PENDING_AO ]

┌────────────────────────────────────────────────────────────────────────┐
│              STAGE 2: VALUATION & EXECUTIVE SANCTION                   │
└────────────────────────────────────────────────────────────────────────┘
        [ AO: Assessment Officer ]
                 │
                 │ (Calculates Rateable Value, base tax, applies slabs)
                 ▼
          [ Status: PENDING_AMC ]
                 │
                 ▼
        [ AMC: Assistant Municipal Commissioner ]
                 │
       ┌─────────┴─────────────────────┐
       ▼                               ▼
 [ High Value / Escalation ]      [ Standard Property ]
       │                               │
       ▼                               ▼
 [ Status: PENDING_HOD ]        [ Status: SANCTIONED ]
       │                               │
       ▼                               │
 [ HOD: Head of Department ]           │
       │                               │
       └──────────────┬────────────────┘
                      ▼
            [ Status: SANCTIONED ]

┌────────────────────────────────────────────────────────────────────────┐
│             STAGE 3: DEMAND GENERATION & BILL DISPATCH                 │
└────────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
        [ BILLING OPERATOR ]
                 │
                 │ (Generates demand notice, rebate deadlines, cess schedule)
                 ▼
          [ Status: BILL_DRAFTED ]
                 │
                 ▼
        [ BILL APPROVER ]
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
  [ REJECT_TO_BILLING ] [ APPROVE_BILL ]
       │                   │
       ▼                   ▼
[ Status: BILL_DRAFTED ] [ Status: BILL_ISSUED / READY_FOR_PAYMENT ]
```

---

## 🛑 Rejection, Query & Escalation Mechanics

To prevent operational bottlenecks and maintain full accountability:
1. **Mandatory Remarks on Rejection**: Any rejection (at DI, AO, AMC, HOD, or Bill Approver level) strictly requires a structured reason category (e.g., `INSUFFICIENT_IMAGE`, `MEASUREMENT_DISCREPANCY`, `INVALID_RATE_SLAB`) plus detailed remarks.
2. **Targeted Return**:
   - Technical measurement errors rejected by **DI** or **AO** return directly to the **SI** for a re-survey.
   - Assessment calculation errors rejected by **AMC** or **HOD** return to the **AO** for re-valuation.
   - Billing errors rejected by **Bill Approver** return to the **Billing Operator**.
3. **Monetary Threshold Escalation**:
   - Properties with calculated annual tax $\le \$50,000$ (or local currency equivalent) finalize at the **AMC** level.
   - Properties exceeding the threshold or flagged as commercial/industrial automatically require **HOD** sign-off.

---

## 🗄️ Proposed Database Schema Design

### 1. Updated `users` Table
```sql
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS chk_user_role;

ALTER TABLE users 
  ADD CONSTRAINT chk_user_role CHECK (
    role IN (
      'si',
      'di',
      'ao',
      'amc',
      'hod',
      'billing_operator',
      'bill_approver',
      'admin'
    )
  );
```

### 2. Enhanced `entries` Table
```sql
-- Extend entries with survey measurements, valuation fields, and lifecycle state
ALTER TABLE entries 
  ADD COLUMN IF NOT EXISTS property_type VARCHAR(50) DEFAULT 'residential', -- residential, commercial, industrial, vacant_land
  ADD COLUMN IF NOT EXISTS built_up_area NUMERIC(10, 2), -- in sq ft / sq meters
  ADD COLUMN IF NOT EXISTS plot_area NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS rateable_value NUMERIC(12, 2), -- calculated by AO
  ADD COLUMN IF NOT EXISTS calculated_tax NUMERIC(12, 2), -- estimated annual tax
  ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'pending_di', 
  ADD COLUMN IF NOT EXISTS current_assigned_role VARCHAR(50) DEFAULT 'di';
```

### 3. New `workflow_logs` Table (Immutable Audit Trail)
Tracks every forward, approve, reject, and return action for government transparency and RTI/Audit readiness:
```sql
CREATE TABLE IF NOT EXISTS workflow_logs (
  id               SERIAL PRIMARY KEY,
  entry_id         INTEGER REFERENCES entries(id) ON DELETE CASCADE,
  actor_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  actor_role       VARCHAR(50) NOT NULL,
  action           VARCHAR(50) NOT NULL, -- SUBMIT, FORWARD, REJECT, SANCTION, ESCALATE
  from_status      VARCHAR(50) NOT NULL,
  to_status        VARCHAR(50) NOT NULL,
  remarks          TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_entry_id ON workflow_logs(entry_id);
```

### 4. New `bills` Table (Billing & Demand Management)
```sql
CREATE TABLE IF NOT EXISTS bills (
  id                SERIAL PRIMARY KEY,
  bill_number       VARCHAR(100) UNIQUE NOT NULL,
  entry_id          INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  financial_year    VARCHAR(20) NOT NULL, -- e.g., '2026-2027'
  base_tax          NUMERIC(12, 2) NOT NULL,
  cess_amount       NUMERIC(10, 2) DEFAULT 0.00,
  penalty_amount    NUMERIC(10, 2) DEFAULT 0.00,
  rebate_amount     NUMERIC(10, 2) DEFAULT 0.00,
  total_amount_due  NUMERIC(12, 2) NOT NULL,
  due_date          DATE NOT NULL,
  status            VARCHAR(50) DEFAULT 'draft', -- draft, pending_approval, approved, paid, overdue
  generated_by      INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Billing Operator
  approved_by       INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Bill Approver
  approved_at       TIMESTAMP,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_entry_id ON bills(entry_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
```

---

## 🔒 Role-Based Permissions Matrix (RBAC)

| Resource / Action | SI | DI | AO | AMC | HOD | Billing Operator | Bill Approver | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Create New Property Entry** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Resubmit Rejected Entry** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Verify Field Measurements** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Compute Valuation & Tax** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Zonal Sanction ($\le \$50k$)** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **High-Value Sanction ($> \$50k$)** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Draft Tax Demand Bill** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Authorize / Release Bill** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **System User Administration** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Recommended Implementation Roadmap

### Phase 1: Foundation & Model Evolution
- [ ] Update Sequelize models (`User`, `Entry`, `WorkflowLog`, `Bill`).
- [ ] Add migration/schema update script (`fix_db.js` or Sequelize migrations).
- [ ] Update registration/user seeding to support all 7 roles.

### Phase 2: Workflow Engine & Backend Logic
- [ ] Implement a unified transition controller (`/api/workflow/transition`).
- [ ] Enforce automated validation checks (e.g. AO cannot forward without calculating rateable value).
- [ ] Add audit logging middleware to append records to `workflow_logs` on every transition.

### Phase 3: Billing & Demand Generation
- [ ] Build `/api/billing` routes for the Billing Operator and Bill Approver.
- [ ] Add invoice generation logic (printable tax demand notice / PDF generation).

### Phase 4: Frontend Dashboards & Unified Workspace
- [ ] Create role-tailored dashboard views or a dynamic workspace that renders actions based on current user permissions.
- [ ] Add timeline audit component displaying the history of remarks and transitions for any property entry.
