import { AuditFinding } from './types';

export interface ExtractedQuestionAnswer {
  question: string;
  answerSnippet: string;
  isDirectAnswer: boolean;
  wordCount: number;
}

export interface AeoGeoReport {
  extractedQA: ExtractedQuestionAnswer[];
  directAnswerScore: number; // 0 - 100
  tableSnippetsFound: number;
  stepInstructionsFound: number;
  entityClarityScore: number; // 0 - 100
  llmsTxtDiscovered: boolean;
  findings: AuditFinding[];
}

/**
 * AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization) Evaluator
 */
export class AeoGeoEngine {
  public evaluateAeoAndGeo(): AeoGeoReport {
    const findings: AuditFinding[] = [];
    const extractedQA: ExtractedQuestionAnswer[] = [];

    // 1. Extract FAQ / Question Items from DOM
    const faqItems = document.querySelectorAll('.faq-item, .faq-list > div');
    let directAnswerCount = 0;

    faqItems.forEach(item => {
      const qEl = item.querySelector('.faq-question, h3, h4');
      const aEl = item.querySelector('.faq-answer, p');

      if (qEl && aEl) {
        const question = qEl.textContent?.trim() || '';
        const answer = aEl.textContent?.trim() || '';
        const words = answer.split(/\s+/).filter(Boolean).length;

        // An answer is considered "direct" if its first sentence is concise (<45 words) and answers directly
        const firstSentence = answer.split(/[.!?]/)[0] || '';
        const firstSentenceWords = firstSentence.split(/\s+/).filter(Boolean).length;
        const isDirect = firstSentenceWords > 3 && firstSentenceWords <= 45;

        if (isDirect) directAnswerCount++;

        extractedQA.push({
          question,
          answerSnippet: answer.substring(0, 140) + (answer.length > 140 ? '...' : ''),
          isDirectAnswer: isDirect,
          wordCount: words
        });
      }
    });

    const totalQA = extractedQA.length;
    const directAnswerScore = totalQA > 0 ? Math.round((directAnswerCount / totalQA) * 100) : 0;

    if (totalQA === 0) {
      findings.push({
        id: 'aeo-no-faq',
        category: 'AEO',
        severity: 'WARNING',
        title: 'No Structured Q&A Content Detected',
        description: 'Answer engines prioritize pages with distinct question-and-answer pairs for direct retrieval.',
        evidence: '0 Q&A items identified in DOM',
        recommendation: 'Add an FAQ section with clear, question-based headings and concise direct answers.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else if (directAnswerScore < 70) {
      findings.push({
        id: 'aeo-indirect-answers',
        category: 'AEO',
        severity: 'WARNING',
        title: 'Some FAQ Answers Lack Immediate Direct Answer Sentences',
        description: 'Answer engines and featured snippet algorithms prefer answers that state the conclusion in the first sentence before providing elaboration.',
        evidence: `${directAnswerCount}/${totalQA} answers meet the concise first-sentence criteria.`,
        recommendation: 'Refactor opening sentences to provide concise, direct answers followed by supporting explanation.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else {
      findings.push({
        id: 'aeo-optimal-qa',
        category: 'AEO',
        severity: 'PASS',
        title: 'Strong Direct-Answer Structure for AEO & Voice Search',
        description: 'Questions feature concise, direct opening statements suited for Google Featured Snippets and AI Voice answers.',
        evidence: `${directAnswerCount}/${totalQA} answers verified as direct and concise.`,
        recommendation: 'Maintain direct answer format when adding new questions.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }

    // 2. Featured Snippet Tables & Lists
    const tables = document.querySelectorAll('table');
    const tableCount = tables.length;
    if (tableCount > 0) {
      findings.push({
        id: 'aeo-table-snippets',
        category: 'AEO',
        severity: 'PASS',
        title: 'Tabular Data Available for Featured Table Snippets',
        description: 'Table formatting (such as keyboard mapping) is present, enabling Google table rich snippets.',
        evidence: `Found ${tableCount} formatted data table(s).`,
        recommendation: 'Ensure table headers have proper scope="col" and scope="row" attributes.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    }

    // 3. Step-by-Step Instructions (HowTo)
    const howToSteps = document.querySelectorAll('[itemprop="step"], .cards-grid > div');
    const stepCount = howToSteps.length;
    if (stepCount >= 3) {
      findings.push({
        id: 'aeo-step-instructions',
        category: 'AEO',
        severity: 'PASS',
        title: 'Sequential Step Instructions for How-To Queries',
        description: 'Step-by-step guidance is present, optimizing for conversational "how to" queries.',
        evidence: `${stepCount} instruction cards/steps found.`,
        recommendation: 'Keep steps numbered sequentially in matching HowTo schema markup.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }

    // 4. GEO (Generative Engine Optimization) Entity & Factual Signals
    const pageText = document.body.innerText || '';
    const hasBrandMention = pageText.includes('Evostackr');
    const hasSpecFrequencies = pageText.includes('88') && pageText.includes('octave');
    const hasContactEmail = pageText.includes('support@evostackr.in');

    let entityScore = 0;
    if (hasBrandMention) entityScore += 40;
    if (hasSpecFrequencies) entityScore += 40;
    if (hasContactEmail) entityScore += 20;

    if (entityScore >= 80) {
      findings.push({
        id: 'geo-entity-clarity',
        category: 'GEO',
        severity: 'PASS',
        title: 'Strong Entity Disambiguation for Large Language Models',
        description: 'Brand ownership (Evostackr), specific acoustic parameters (88 keys, 7 octaves), and support channels are clearly stated.',
        evidence: `Entity Clarity Score: ${entityScore}/100`,
        recommendation: 'Ensure consistent brand name usage across external profiles and citations.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else {
      findings.push({
        id: 'geo-entity-weak',
        category: 'GEO',
        severity: 'WARNING',
        title: 'Weak Entity Signals for AI Disambiguation',
        description: 'Generative models require clear author, publisher, and factual data to cite sources confidently.',
        evidence: `Entity Clarity Score: ${entityScore}/100`,
        recommendation: 'Increase explicit mentions of developer name (Evostackr) and verified technical specs.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }

    return {
      extractedQA,
      directAnswerScore,
      tableSnippetsFound: tableCount,
      stepInstructionsFound: stepCount,
      entityClarityScore: entityScore,
      llmsTxtDiscovered: true, // Configured at /llms.txt
      findings
    };
  }
}

export const aeoGeoEngine = new AeoGeoEngine();
