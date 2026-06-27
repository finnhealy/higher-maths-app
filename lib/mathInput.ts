export const MATH_INPUT_CURSOR = '□';
export const MATH_INPUT_CARET = '¦';
export const POWER_BOX_TOKEN = 'power-box';
export const SQRT_BOX_TOKEN = 'sqrt-box';
export const FRACTION_BOX_TOKEN = 'fraction-box';

function powerTokenValue(token: string) {
  const match = token.match(/^\^\{([^{}]+)\}$/);
  return match?.[1] ?? token;
}

function removeIncompleteLatexCommandTail(value: string) {
  return value.replace(/\\f(?:r(?:a(?:c)?)?)?$/, '').replace(/\\s(?:q(?:r(?:t)?)?)?$/, '');
}

export function cleanMathInput(value: string) {
  return value
    .replaceAll(MATH_INPUT_CURSOR, '')
    .replaceAll(MATH_INPUT_CARET, '')
    .replace(/\^\{\}/g, '')
    .replace(/sqrt\(\)/g, '')
    .replace(/\\frac\{\}\{\}/g, '');
}

export function insertMathToken(current: string, token: string) {
  const insertion =
    token === POWER_BOX_TOKEN
      ? `^{${MATH_INPUT_CURSOR}${MATH_INPUT_CARET}}`
      : token === SQRT_BOX_TOKEN
        ? `sqrt(${MATH_INPUT_CURSOR}${MATH_INPUT_CARET})`
        : token === FRACTION_BOX_TOKEN
          ? `\\frac{${MATH_INPUT_CURSOR}${MATH_INPUT_CARET}}{${MATH_INPUT_CURSOR}}`
          : token;

  if (current.includes(MATH_INPUT_CARET)) {
    if (token === POWER_BOX_TOKEN || token === SQRT_BOX_TOKEN || token === FRACTION_BOX_TOKEN) {
      return current.replace(MATH_INPUT_CARET, insertion);
    }

    return current.replace(MATH_INPUT_CARET, `${powerTokenValue(token)}${MATH_INPUT_CARET}`);
  }

  if (!current.includes(MATH_INPUT_CURSOR)) {
    return `${current}${insertion}`;
  }

  if (token === POWER_BOX_TOKEN || token === SQRT_BOX_TOKEN || token === FRACTION_BOX_TOKEN) {
    return current.replace(MATH_INPUT_CURSOR, insertion);
  }

  return current.replace(MATH_INPUT_CURSOR, `${powerTokenValue(token)}${MATH_INPUT_CARET}`);
}

export function removeLastMathToken(value: string) {
  const activeCaretIndex = value.indexOf(MATH_INPUT_CARET);

  if (activeCaretIndex >= 0) {
    const beforeCaret = value.slice(0, activeCaretIndex);
    const afterCaret = value.slice(activeCaretIndex + MATH_INPUT_CARET.length);

    if (beforeCaret.endsWith(MATH_INPUT_CURSOR)) {
      if (beforeCaret.endsWith(`^{${MATH_INPUT_CURSOR}`) && afterCaret.startsWith('}')) {
        return `${beforeCaret.slice(0, -3)}${afterCaret.slice(1)}`;
      }

      if (beforeCaret.endsWith(`sqrt(${MATH_INPUT_CURSOR}`) && afterCaret.startsWith(')')) {
        return `${beforeCaret.slice(0, -6)}${afterCaret.slice(1)}`;
      }

      if (beforeCaret.endsWith(`\\frac{${MATH_INPUT_CURSOR}`) && afterCaret.startsWith(`}{${MATH_INPUT_CURSOR}}`)) {
        return `${beforeCaret.slice(0, -7)}${afterCaret.slice(4)}`;
      }

      const emptyDenominatorMatch = beforeCaret.match(/\\frac\{([^{}]*)\}\{□$/);
      if (emptyDenominatorMatch && afterCaret.startsWith('}')) {
        return `${beforeCaret.slice(0, emptyDenominatorMatch.index)}${emptyDenominatorMatch[1]}${afterCaret.slice(1)}`;
      }

      return `${beforeCaret}${afterCaret}`;
    }

    return `${removeIncompleteLatexCommandTail(beforeCaret.slice(0, -1))}${MATH_INPUT_CARET}${afterCaret}`;
  }

  const cursorIndex = value.indexOf(MATH_INPUT_CURSOR);

  if (cursorIndex >= 0) {
    const beforeCursor = value.slice(0, cursorIndex);
    const afterCursor = value.slice(cursorIndex + MATH_INPUT_CURSOR.length);

    if (beforeCursor.endsWith('^{') && afterCursor.startsWith('}')) {
      return `${beforeCursor.slice(0, -2)}${afterCursor.slice(1)}`;
    }

    if (beforeCursor.endsWith('sqrt(') && afterCursor.startsWith(')')) {
      return `${beforeCursor.slice(0, -5)}${afterCursor.slice(1)}`;
    }

    if (beforeCursor.endsWith('\\frac{') && afterCursor.startsWith(`}{${MATH_INPUT_CURSOR}}`)) {
      return `${beforeCursor.slice(0, -6)}${afterCursor.slice(4)}`;
    }

    const emptyDenominatorMatch = beforeCursor.match(/\\frac\{([^{}]*)\}\{$/);
    if (emptyDenominatorMatch && afterCursor.startsWith('}')) {
      return `${beforeCursor.slice(0, emptyDenominatorMatch.index)}${emptyDenominatorMatch[1]}${afterCursor.slice(1)}`;
    }

    if (beforeCursor.endsWith('}{') && afterCursor.startsWith('}')) {
      return `${beforeCursor.slice(0, -2)}${afterCursor.slice(1)}`;
    }

    return `${removeIncompleteLatexCommandTail(beforeCursor.slice(0, -1))}${MATH_INPUT_CURSOR}${afterCursor}`;
  }

  const groupedPowerMatch = value.match(/\^\{[^{}]*\}$/);
  if (groupedPowerMatch) {
    return value.slice(0, groupedPowerMatch.index);
  }

  return value.slice(0, -1);
}

export function selectMathBox(value: string, boxIndex: number) {
  const withoutCaret = value.replaceAll(MATH_INPUT_CARET, '');
  let currentBox = 0;

  for (let index = 0; index < withoutCaret.length; index += 1) {
    if (withoutCaret[index] !== MATH_INPUT_CURSOR) {
      continue;
    }

    if (currentBox === boxIndex) {
      return `${withoutCaret.slice(0, index + 1)}${MATH_INPUT_CARET}${withoutCaret.slice(index + 1)}`;
    }

    currentBox += 1;
  }

  return value;
}

export function selectMathEnd(value: string) {
  return `${value.replaceAll(MATH_INPUT_CARET, '')}${MATH_INPUT_CARET}`;
}
