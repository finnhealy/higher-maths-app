export const MATH_INPUT_CURSOR = '□';
export const POWER_BOX_TOKEN = 'power-box';

function powerTokenValue(token: string) {
  const match = token.match(/^\^\{([^{}]+)\}$/);
  return match?.[1] ?? token;
}

export function cleanMathInput(value: string) {
  return value.replaceAll(MATH_INPUT_CURSOR, '').replace(/\^\{\}/g, '');
}

export function insertMathToken(current: string, token: string) {
  const insertion = token === POWER_BOX_TOKEN ? `^{${MATH_INPUT_CURSOR}}` : token;

  if (!current.includes(MATH_INPUT_CURSOR)) {
    return `${current}${insertion}`;
  }

  if (token === POWER_BOX_TOKEN) {
    return current.replace(MATH_INPUT_CURSOR, insertion);
  }

  return current.replace(MATH_INPUT_CURSOR, powerTokenValue(token));
}

export function removeLastMathToken(value: string) {
  const cursorIndex = value.indexOf(MATH_INPUT_CURSOR);

  if (cursorIndex >= 0) {
    const beforeCursor = value.slice(0, cursorIndex);
    const afterCursor = value.slice(cursorIndex + MATH_INPUT_CURSOR.length);

    if (beforeCursor.endsWith('^{') && afterCursor.startsWith('}')) {
      return `${beforeCursor.slice(0, -2)}${afterCursor.slice(1)}`;
    }

    return `${beforeCursor.slice(0, -1)}${MATH_INPUT_CURSOR}${afterCursor}`;
  }

  const groupedPowerMatch = value.match(/\^\{[^{}]*\}$/);
  if (groupedPowerMatch) {
    return value.slice(0, groupedPowerMatch.index);
  }

  return value.slice(0, -1);
}
