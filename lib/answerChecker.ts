import { AnswerType } from '@/types/maths';

type CheckAnswerParams = {
  given: string;
  expected: string;
  acceptedAnswers?: string[];
  answerType?: AnswerType;
};

const superscriptMap: Record<string, string> = {
  '⁰': '^0',
  '¹': '^1',
  '²': '^2',
  '³': '^3',
  '⁴': '^4',
  '⁵': '^5',
  '⁶': '^6',
  '⁷': '^7',
  '⁸': '^8',
  '⁹': '^9',
  '⁻': '^-',
};

function stripOuterMath(value: string) {
  return value.trim().replace(/^\$/, '').replace(/\$$/, '');
}

export function normaliseAnswer(value: string) {
  let output = stripOuterMath(value)
    .toLowerCase()
    .replace(/□/g, '')
    .replace(/\^\{([^{}]+)\}/g, '^$1')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/sqrt\(([^)]+)\)/g, 'sqrt$1')
    .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt$1')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/degrees?|deg|°/g, '')
    .replace(/\\circ/g, '')
    .replace(/\\ /g, '')
    .replace(/\\/g, '')
    .replace(/\s+/g, '');

  Object.entries(superscriptMap).forEach(([symbol, replacement]) => {
    output = output.replaceAll(symbol, replacement);
  });

  return output;
}

function parseNumeric(value: string) {
  const normalised = normaliseAnswer(value).replace(/[()]/g, '');
  const fractionMatch = normalised.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);

  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator === 0) {
      return undefined;
    }
    return numerator / denominator;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(normalised)) {
    return Number(normalised);
  }

  return undefined;
}

function parseCoordinate(value: string) {
  const normalised = normaliseAnswer(value).replace(/[()]/g, '');
  const parts = normalised.split(',');
  if (parts.length !== 2) {
    return undefined;
  }

  const x = parseNumeric(parts[0]);
  const y = parseNumeric(parts[1]);
  if (x === undefined || y === undefined) {
    return undefined;
  }

  return [x, y] as const;
}

function almostEqual(left: number, right: number) {
  return Math.abs(left - right) < 1e-9;
}

function expressionEquivalent(given: string, expected: string) {
  const clean = (value: string) => normaliseAnswer(value).replace(/\*/g, '').replace(/\+\-/g, '-');
  return clean(given) === clean(expected);
}

function valuesEquivalent(given: string, expected: string, answerType: AnswerType) {
  if (answerType === 'number') {
    const givenNumber = parseNumeric(given);
    const expectedNumber = parseNumeric(expected);
    return givenNumber !== undefined && expectedNumber !== undefined && almostEqual(givenNumber, expectedNumber);
  }

  if (answerType === 'coordinate') {
    const givenCoordinate = parseCoordinate(given);
    const expectedCoordinate = parseCoordinate(expected);
    return (
      givenCoordinate !== undefined &&
      expectedCoordinate !== undefined &&
      almostEqual(givenCoordinate[0], expectedCoordinate[0]) &&
      almostEqual(givenCoordinate[1], expectedCoordinate[1])
    );
  }

  if (answerType === 'expression' || answerType === 'equation') {
    return expressionEquivalent(given, expected);
  }

  return normaliseAnswer(given) === normaliseAnswer(expected);
}

export function checkAnswer({ given, expected, acceptedAnswers = [], answerType = 'text' }: CheckAnswerParams) {
  const answers = [expected, ...acceptedAnswers];
  return answers.some((answer) => valuesEquivalent(given, answer, answerType) || normaliseAnswer(given) === normaliseAnswer(answer));
}

export function getAnswerInputHelp(answerType?: AnswerType) {
  if (answerType === 'number') {
    return 'Type fractions as 5/4, decimals as 1.25, powers as x^2.';
  }
  if (answerType === 'coordinate') {
    return 'Type coordinates like (4,6) or 4,6.';
  }
  if (answerType === 'equation') {
    return 'Type equations like y=2x+1. Use ^ for powers and / for fractions.';
  }
  if (answerType === 'expression') {
    return 'Use ^ for powers, / for fractions, and sqrt(3) for roots.';
  }
  return 'Use ^ for powers, / for fractions, and sqrt(3) for roots.';
}
