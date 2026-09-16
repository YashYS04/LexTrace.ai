export interface SampleContract {
  id: string;
  title: string;
  persona: 'Freelancer' | 'Tenant' | 'Employee';
  description: string;
  text: string;
  suggestedQuestions: string[];
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'freelance_aggressive',
    title: 'Freelance Agreement (Aggressive)',
    persona: 'Freelancer',
    description: 'A contractor agreement with unilateral indemnity, broad IP forfeiture, and subjective payment withholding.',
    suggestedQuestions: [
      'Can the client withhold payment if they are dissatisfied?',
      'Do they own code I write on personal time?',
      'Is my liability capped or unlimited?',
    ],
    text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

1. SCOPE OF SERVICES
Contractor agrees to perform software development, architecture review, and deployment services as described in Statement of Work #1 attached hereto. Any modification to the scope must be agreed in writing signed by Client.

2. PAYMENT TERMS & COMPENSATION
Client shall pay Contractor the sum of $85.00 per hour. Contractor shall invoice Client bi-weekly. Client reserves the sole and unreviewable discretion to withhold payment for any deliverables deemed unsatisfactory, incomplete, or requiring revision. In the event of an invoice dispute, Client may withhold payment of all invoices pending final resolution. No interest or late fees shall accrue on any withheld amounts.

3. INTELLECTUAL PROPERTY OWNERSHIP
Contractor agrees that all works of authorship, code, inventions, algorithms, designs, documentation, patents, and improvements created, conceived, or reduced to practice by Contractor—whether created during working hours or during Contractor's personal time, and whether utilizing Client equipment or personal equipment—during the entire term of this Agreement and for twelve (12) months thereafter, shall be considered "work made for hire" and shall immediately become the sole and exclusive property of Client worldwide in perpetuity. Contractor unconditionally waives all moral rights.

4. INDEMNIFICATION
Contractor shall fully indemnify, defend, and hold harmless Client, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, losses, damages, costs, and expenses (including attorney fees and court costs) arising out of or related to Contractor's performance of services, any alleged breach of this Agreement, or any third-party claim alleging infringement of intellectual property rights, regardless of whether Client was contributorily negligent. Client shall have no obligation to indemnify Contractor.

5. LIMITATION OF LIABILITY
IN NO EVENT SHALL CLIENT BE LIABLE TO CONTRACTOR FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, NOR SHALL CLIENT'S TOTAL AGGREGATE LIABILITY ARISING UNDER OR IN CONNECTION WITH THIS AGREEMENT EXCEED THE SUM OF ONE HUNDRED DOLLARS ($100.00). CONTRACTOR'S LIABILITY UNDER THIS AGREEMENT SHALL BE COMPLETELY UNCAPPED.

6. TERMINATION
Client may terminate this Agreement at any time, with or without cause, immediately upon written notice to Contractor. Contractor may terminate this Agreement only upon providing ninety (90) days prior written notice to Client. In the event of termination by Client, Contractor shall only be paid for work expressly approved in writing prior to the termination date.

7. NON-COMPETITION AND NON-SOLICITATION
During the term of this Agreement and for a period of two (2) years following the termination of this Agreement for any reason, Contractor shall not, directly or indirectly, perform software engineering services, consult for, advise, or engage with any business or client in the fintech, payments, or cloud infrastructure sectors anywhere in North America.`,
  },
  {
    id: 'freelance_balanced',
    title: 'Freelance Agreement (Balanced Counter-Draft)',
    persona: 'Freelancer',
    description: 'Fair-market negotiated version with mutual indemnification, Net 30, background IP carve-outs, and reasonable caps.',
    suggestedQuestions: [
      'What are the payment terms in this version?',
      'How does this version protect background IP?',
      'What is the mutual liability cap?',
    ],
    text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

1. SCOPE OF SERVICES
Contractor agrees to perform software development, architecture review, and deployment services as described in Statement of Work #1 attached hereto. Any modification to the scope must be agreed upon in a written amendment signed by both parties.

2. PAYMENT TERMS & COMPENSATION
Client shall pay Contractor the sum of $85.00 per hour. Contractor shall invoice Client bi-weekly. Client shall pay all undisputed invoice amounts within thirty (30) days of receipt (Net 30). In the event of a good faith dispute regarding an invoice, Client shall pay the undisputed portion on time and provide written notice detailing the dispute within ten (10) business days. Overdue balances shall accrue interest at the rate of 1.5% per month.

3. INTELLECTUAL PROPERTY OWNERSHIP
Upon full and final payment of all applicable fees, Contractor assigns to Client all rights, title, and interest in and to the custom deliverables specifically developed for Client under this Agreement. Contractor retains all right, title, and interest in pre-existing tools, libraries, general design patterns, and proprietary software ("Background IP"). Contractor retains full ownership of any inventions created on personal time without Client equipment.

4. INDEMNIFICATION
Each party shall indemnify, defend, and hold harmless the other party from and against any third-party claims resulting from the indemnifying party's gross negligence, willful misconduct, or material breach. Contractor's indemnity for IP infringement shall apply only to deliverables as delivered by Contractor, excluding modifications made by Client.

5. LIMITATION OF LIABILITY
NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. EACH PARTY'S TOTAL AGGREGATE LIABILITY SHALL BE LIMITED TO THE TOTAL FEES PAID OR PAYABLE BY CLIENT TO CONTRACTOR IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

6. TERMINATION
Either party may terminate this Agreement without cause upon providing thirty (30) days prior written notice. Either party may terminate immediately for cause if the other party materially breaches and fails to cure within fifteen (15) days. Client shall promptly pay Contractor for all services performed up to the termination date.

7. NON-SOLICITATION
Neither party shall actively solicit for employment any employee of the other party directly involved in the engagement for twelve (12) months. There shall be no restriction on Contractor's right to perform software engineering or consulting services for other clients or industries.`,
  },
  {
    id: 'residential_lease_aggressive',
    title: 'Residential Lease (Aggressive Landlord)',
    persona: 'Tenant',
    description: 'Lease with unannounced landlord entry, non-refundable deposit traps, tenant paying all repairs, and automatic 120-day rollover.',
    suggestedQuestions: [
      'Can the landlord enter my apartment without notice?',
      'Can the landlord keep my security deposit if I leave early?',
      'Who is responsible for HVAC and plumbing repairs?',
    ],
    text: `RESIDENTIAL LEASE AGREEMENT

1. PREMISES AND TERM
Landlord hereby leases to Tenant the residential premises located at 742 Evergreen Terrace, Apt 4B for a fixed term of twelve (12) months commencing on September 1, 2024, and ending August 31, 2025.

2. RENT AND LATE CHARGES
Tenant shall pay monthly rent in the amount of $2,400.00 due on or before the first (1st) day of each calendar month. If rent is not received by 11:59 PM on the 2nd day of the month, a late charge of $150.00 plus $25.00 per day shall immediately apply. Rent increases of up to 15% may be implemented by Landlord at any time upon thirty (30) days notice.

3. SECURITY DEPOSIT
Tenant shall deposit with Landlord the sum of $4,800.00 as security. Landlord may commingle the deposit with Landlord's general operating funds. Tenant acknowledges and agrees that the security deposit is strictly non-refundable if Tenant terminates the lease even one day prior to the expiration date. Landlord may deduct amounts for any painting, carpet cleaning, or administrative processing without presenting receipts.

4. LANDLORD RIGHT OF ENTRY
Landlord and Landlord's agents shall have the unrestricted right to enter the Premises at any hour of the day or night without prior notice to Tenant for inspections, repairs, showings, or any arbitrary business purpose. Tenant shall not change locks.

5. MAINTENANCE AND REPAIRS
Tenant shall be solely responsible for all maintenance, repairs, plumbing clogs, HVAC servicing, appliance repairs, pest extermination, and structural upkeep of the Premises regardless of whether the damage was caused by normal wear and tear or acts of nature. Landlord shall have zero duty to repair any condition.

6. TERMINATION AND AUTOMATIC RENEWAL
This Lease shall automatically renew for an additional twelve (12) month term at a 20% rent increase unless Tenant provides written notice of non-renewal via certified mail at least one hundred and twenty (120) days prior to lease expiration. If Tenant vacates early, Tenant remains liable for all remaining rent for the unexpired term immediately accelerated and payable upon demand.`,
  },
  {
    id: 'employment_trap',
    title: 'Employment Agreement (IP & Non-Compete Trap)',
    persona: 'Employee',
    description: 'Employment terms with total IP capture (even off-hours and home projects), 24-month worldwide non-compete, and non-disparagement gag clauses.',
    suggestedQuestions: [
      'Does company own inventions I build on weekends at home?',
      'How long and broad is the non-compete restriction?',
      'Can I be sued for writing an honest Glassdoor review?',
    ],
    text: `EMPLOYMENT AND PROPRIETARY INFORMATION AGREEMENT

1. POSITION AND DUTIES
Employee will serve as Senior Systems Architect, performing duties assigned by Company management, working full-time and exclusively for Company.

2. COMPENSATION AND BENEFITS
Employee shall receive an annualized base salary of $145,000, payable in accordance with Company's standard payroll cycle. Discretionary bonuses and equity vesting are subject to unilateral cancellation or modification by the Board of Directors at any time without advance notice.

3. INVENTIONS AND INTELLECTUAL PROPERTY ASSIGNMENT
Employee acknowledges and agrees that all inventions, discoveries, designs, concepts, software, algorithms, ideas, writing, and intellectual property developed, authored, or conceived by Employee—whether during or outside working hours, whether on Company premises or at home, whether using Company equipment or personal devices, and whether or not related to Company's current or prospective business—shall be the sole and exclusive property of Company from the moment of conception in perpetuity worldwide.

4. NON-COMPETE RESTRICTIONS
During employment and for a period of twenty-four (24) months following termination of employment for any reason (whether voluntary or involuntary), Employee shall not work for, consult with, invest in, advise, or provide any technology services to any entity that operates in the software, enterprise technology, or digital cloud space anywhere in the world.

5. NON-SOLICITATION AND NON-DISPARAGEMENT
Employee shall not solicit Company employees or clients for thirty-six (36) months following termination. Employee agrees never to publish, utter, or communicate any statement, review, or critique that can be construed as disparaging or negative towards Company, its leadership, products, or workplace culture, whether on public social media, Glassdoor, or in private communications.`,
  },
];
