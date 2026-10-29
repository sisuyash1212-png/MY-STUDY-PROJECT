import { Chapter } from '../types';

export const RAW_CHAPTERS_DATA: Omit<Chapter, 'status' | 'revisionStatus' | 'notes' | 'confidenceRating' | 'difficultyRating'>[] = [
  { id: 1, srNo: 1, name: "Substances in Common Use", sourceBoard: "State Board", weightagePerYear: "4–5 Ques", totalQuestions: 100 },
  { id: 2, srNo: 2, name: "Life Process in Living Organisms", sourceBoard: "State Board", weightagePerYear: "4–5 Ques", totalQuestions: 89 },
  { id: 3, srNo: 3, name: "Measurement of Matter", sourceBoard: "Common", weightagePerYear: "4–5 Ques", totalQuestions: 89 },
  { id: 4, srNo: 4, name: "Acids, Bases & Salts", sourceBoard: "State Board", weightagePerYear: "4–5 Ques", totalQuestions: 89 },
  { id: 5, srNo: 5, name: "Why do we Fall ill?", sourceBoard: "Common", weightagePerYear: "3–4 Ques", totalQuestions: 77 },
  { id: 6, srNo: 6, name: "Metals & Non-metals", sourceBoard: "8th NCERT & State Board", weightagePerYear: "3–4 Ques", totalQuestions: 72 },
  { id: 7, srNo: 7, name: "Carbon : An Important Element", sourceBoard: "State Board", weightagePerYear: "3–4 Ques", totalQuestions: 71 },
  { id: 8, srNo: 8, name: "Work & Energy", sourceBoard: "Common", weightagePerYear: "3–4 Ques", totalQuestions: 67 },
  { id: 9, srNo: 9, name: "Sound", sourceBoard: "Common", weightagePerYear: "3–4 Ques", totalQuestions: 61 },
  { id: 10, srNo: 10, name: "Current Electricity", sourceBoard: "State Board", weightagePerYear: "3–4 Ques", totalQuestions: 60 },
  { id: 11, srNo: 11, name: "Reflection of Light", sourceBoard: "State Board", weightagePerYear: "3–4 Ques", totalQuestions: 57 },
  { id: 12, srNo: 12, name: "Structure of The Atom", sourceBoard: "NCERT", weightagePerYear: "3–4 Ques", totalQuestions: 53 },
  { id: 13, srNo: 13, name: "The Fundamental Unit of Life", sourceBoard: "NCERT", weightagePerYear: "3–4 Ques", totalQuestions: 51 },
  { id: 14, srNo: 14, name: "Fluid", sourceBoard: "NCERT", weightagePerYear: "2–3 Ques", totalQuestions: 50 },
  { id: 15, srNo: 15, name: "Motion", sourceBoard: "Common", weightagePerYear: "2–3 Ques", totalQuestions: 48 },
  { id: 16, srNo: 16, name: "Tissues", sourceBoard: "Common", weightagePerYear: "2–3 Ques", totalQuestions: 44 },
  { id: 17, srNo: 17, name: "Energy Flow in Ecosystem", sourceBoard: "State Board", weightagePerYear: "2–3 Ques", totalQuestions: 41 },
  { id: 18, srNo: 18, name: "Heat", sourceBoard: "State Board", weightagePerYear: "2–3 Ques", totalQuestions: 41 },
  { id: 19, srNo: 19, name: "Laws of Motion", sourceBoard: "Common", weightagePerYear: "2–3 Ques", totalQuestions: 40 },
  { id: 20, srNo: 20, name: "Classification of Plants", sourceBoard: "State Board", weightagePerYear: "2–3 Ques", totalQuestions: 38 },
  { id: 21, srNo: 21, name: "Is Matter Around Us Pure?", sourceBoard: "NCERT", weightagePerYear: "2–3 Ques", totalQuestions: 36 },
  { id: 22, srNo: 22, name: "Useful & Harmful Microbes", sourceBoard: "State Board", weightagePerYear: "2–3 Ques", totalQuestions: 35 },
  { id: 23, srNo: 23, name: "Improvement in Food Resources", sourceBoard: "NCERT", weightagePerYear: "2–3 Ques", totalQuestions: 35 },
  { id: 24, srNo: 24, name: "Diversity in Living Organisms", sourceBoard: "Common", weightagePerYear: "2–3 Ques", totalQuestions: 35 },
  { id: 25, srNo: 25, name: "Heredity & Variation", sourceBoard: "State Board", weightagePerYear: "2–3 Ques", totalQuestions: 31 },
  { id: 26, srNo: 26, name: "Introduction to Biotechnology", sourceBoard: "State Board", weightagePerYear: "1–2 Ques", totalQuestions: 29 },
  { id: 27, srNo: 27, name: "Gravitation", sourceBoard: "NCERT", weightagePerYear: "1–2 Ques", totalQuestions: 27 },
  { id: 28, srNo: 28, name: "Matter In Our Surrounding", sourceBoard: "NCERT", weightagePerYear: "1–2 Ques", totalQuestions: 23 },
  { id: 29, srNo: 29, name: "Environmental Management", sourceBoard: "State Board", weightagePerYear: "1–2 Ques", totalQuestions: 19 },
  { id: 30, srNo: 30, name: "Morphology in Flowering Plants", sourceBoard: "NCERT", weightagePerYear: "1–2 Ques", totalQuestions: 16 },
  { id: 31, srNo: 31, name: "Natural Resources", sourceBoard: "Common", weightagePerYear: "1 Ques", totalQuestions: 13 },
  { id: 32, srNo: 32, name: "Information Communication Technology (ICT)", sourceBoard: "State Board", weightagePerYear: "1 Ques", totalQuestions: 13 },
  { id: 33, srNo: 33, name: "Reproduction in Plants", sourceBoard: "7th NCERT", weightagePerYear: "1 Ques", totalQuestions: 13 },
  { id: 34, srNo: 34, name: "Observing space : Telescopes", sourceBoard: "State Board", weightagePerYear: "1 Ques", totalQuestions: 11 },
  { id: 35, srNo: 35, name: "Human Body & Organ System", sourceBoard: "8th State Board", weightagePerYear: "1 Ques", totalQuestions: 9 },
  { id: 36, srNo: 36, name: "The Digestive System in Human Beings", sourceBoard: "7th State Board", weightagePerYear: "1 Ques", totalQuestions: 9 },
  { id: 37, srNo: 37, name: "Energy Flow in Ecosystem", sourceBoard: "State Board", weightagePerYear: "1 Ques", totalQuestions: 5 },
  { id: 38, srNo: 38, name: "Biodiversity", sourceBoard: "NCERT", weightagePerYear: "1 Ques", totalQuestions: 5 },
  { id: 39, srNo: 39, name: "Respiration in Plants", sourceBoard: "7th NCERT", weightagePerYear: "1 Ques", totalQuestions: 4 },
  { id: 40, srNo: 40, name: "General Knowledge In Science", sourceBoard: "General Knowledge", weightagePerYear: "10 Ques", totalQuestions: 170 }
];

export function getInitialChapters(): Chapter[] {
  return RAW_CHAPTERS_DATA.map((ch) => ({
    ...ch,
    status: 'not-started',
    revisionStatus: false,
    notes: '',
    difficultyRating: ch.totalQuestions > 60 ? 'Hard' : ch.totalQuestions > 30 ? 'Medium' : 'Easy',
    confidenceRating: 3,
  }));
}

export function parseWeightageScore(weightage: string): number {
  if (weightage.includes('10')) return 10;
  if (weightage.includes('4–5') || weightage.includes('4-5')) return 4.5;
  if (weightage.includes('3–4') || weightage.includes('3-4')) return 3.5;
  if (weightage.includes('2–3') || weightage.includes('2-3')) return 2.5;
  if (weightage.includes('1–2') || weightage.includes('1-2')) return 1.5;
  if (weightage.includes('1 Ques')) return 1.0;
  return 1.0;
}
