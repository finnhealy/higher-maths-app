export type ExpressionPathSegment = number | 'numerator' | 'denominator' | 'value' | 'base' | 'exponent' | 'body' | 'argument';
export type ExpressionPath = ExpressionPathSegment[];

export type RowNode = {
  type: 'row';
  children: ExpressionNode[];
};

export type PlaceholderNode = {
  id: string;
  type: 'placeholder';
  kind: 'slot' | 'cursor';
};

export type NumberNode = {
  id: string;
  type: 'number';
  value: string;
};

export type IdentifierNode = {
  id: string;
  type: 'identifier';
  value: string;
};

export type OperatorNode = {
  id: string;
  type: 'operator';
  value: string;
};

export type FractionNode = {
  id: string;
  type: 'fraction';
  numerator: RowNode;
  denominator: RowNode;
};

export type SqrtNode = {
  id: string;
  type: 'sqrt';
  value: RowNode;
};

export type PowerNode = {
  id: string;
  type: 'power';
  base: RowNode;
  exponent: RowNode;
};

export type GroupNode = {
  id: string;
  type: 'group';
  body: RowNode;
};

export type FunctionNode = {
  id: string;
  type: 'function';
  name: 'sin' | 'cos';
  argument: RowNode;
};

export type ExpressionNode =
  | PlaceholderNode
  | NumberNode
  | IdentifierNode
  | OperatorNode
  | FractionNode
  | SqrtNode
  | PowerNode
  | GroupNode
  | FunctionNode;

export type ExpressionEditorState = {
  root: RowNode;
  cursorPath: ExpressionPath;
};

export type ExpressionNavigationAction = 'left' | 'right' | 'up' | 'down' | 'next-placeholder';

let nextId = 0;

function createId() {
  nextId += 1;
  return `expr-${nextId}`;
}

function placeholder(kind: PlaceholderNode['kind'] = 'slot'): PlaceholderNode {
  return { id: createId(), type: 'placeholder', kind };
}

function cursorPlaceholder() {
  return placeholder('cursor');
}

function emptyRow(kind: PlaceholderNode['kind'] = 'slot'): RowNode {
  return { type: 'row', children: [placeholder(kind)] };
}

function atomForToken(token: string): NumberNode | IdentifierNode | OperatorNode {
  if (/^\d|\.$/.test(token)) {
    return { id: createId(), type: 'number', value: token };
  }

  if (token === 'x' || token === 'y') {
    return { id: createId(), type: 'identifier', value: token };
  }

  return { id: createId(), type: 'operator', value: token };
}

function cloneRow(row: RowNode): RowNode {
  return { type: 'row', children: row.children.map(cloneNode) };
}

function cloneNode(node: ExpressionNode): ExpressionNode {
  if (node.type === 'fraction') {
    return { ...node, numerator: cloneRow(node.numerator), denominator: cloneRow(node.denominator) };
  }
  if (node.type === 'sqrt') {
    return { ...node, value: cloneRow(node.value) };
  }
  if (node.type === 'power') {
    return { ...node, base: cloneRow(node.base), exponent: cloneRow(node.exponent) };
  }
  if (node.type === 'group') {
    return { ...node, body: cloneRow(node.body) };
  }
  if (node.type === 'function') {
    return { ...node, argument: cloneRow(node.argument) };
  }
  return { ...node };
}

export function isSameExpressionPath(left: ExpressionPath, right: ExpressionPath) {
  return left.length === right.length && left.every((segment, index) => segment === right[index]);
}

function getChildRow(node: ExpressionNode, field: ExpressionPathSegment): RowNode {
  if (field === 'numerator' && node.type === 'fraction') {
    return node.numerator;
  }
  if (field === 'denominator' && node.type === 'fraction') {
    return node.denominator;
  }
  if (field === 'value' && node.type === 'sqrt') {
    return node.value;
  }
  if (field === 'base' && node.type === 'power') {
    return node.base;
  }
  if (field === 'exponent' && node.type === 'power') {
    return node.exponent;
  }
  if (field === 'body' && node.type === 'group') {
    return node.body;
  }
  if (field === 'argument' && node.type === 'function') {
    return node.argument;
  }
  throw new Error(`Invalid expression row path: ${String(field)}`);
}

export function getExpressionRow(root: RowNode, rowPath: ExpressionPath): RowNode {
  let row = root;
  for (let index = 0; index < rowPath.length; index += 2) {
    const childIndex = rowPath[index];
    const field = rowPath[index + 1];
    if (typeof childIndex !== 'number' || field === undefined) {
      throw new Error('Invalid expression row path');
    }
    row = getChildRow(row.children[childIndex], field);
  }
  return row;
}

function getParentRowPath(nodePath: ExpressionPath): ExpressionPath {
  return nodePath.slice(0, -1);
}

function getNodeIndex(nodePath: ExpressionPath) {
  const last = nodePath[nodePath.length - 1];
  if (typeof last !== 'number') {
    throw new Error('Invalid expression node path');
  }
  return last;
}

function getActiveRowAndIndex(root: RowNode, cursorPath: ExpressionPath) {
  const rowPath = getParentRowPath(cursorPath);
  const row = getExpressionRow(root, rowPath);
  return { row, rowPath, index: getNodeIndex(cursorPath) };
}

function createEditorWith(root: RowNode, cursorPath: ExpressionPath): ExpressionEditorState {
  return { root, cursorPath };
}

function rowToString(row: RowNode): string {
  return row.children.map(nodeToString).join('');
}

function nodeToString(node: ExpressionNode): string {
  if (node.type === 'placeholder') {
    return '';
  }
  if (node.type === 'number' || node.type === 'identifier' || node.type === 'operator') {
    return node.value;
  }
  if (node.type === 'fraction') {
    return `\\frac{${rowToString(node.numerator)}}{${rowToString(node.denominator)}}`;
  }
  if (node.type === 'sqrt') {
    return `sqrt(${rowToString(node.value)})`;
  }
  if (node.type === 'power') {
    return `${rowToString(node.base)}^{${rowToString(node.exponent)}}`;
  }
  if (node.type === 'group') {
    return `(${rowToString(node.body)})`;
  }
  return `${node.name}(${rowToString(node.argument)})`;
}

export function createExpressionEditorState(): ExpressionEditorState {
  return {
    root: emptyRow(),
    cursorPath: [0],
  };
}

export function expressionToString(state: ExpressionEditorState) {
  return rowToString(state.root);
}

export function isExpressionEmpty(state: ExpressionEditorState) {
  return expressionToString(state).trim().length === 0;
}

function insertAtom(state: ExpressionEditorState, token: string): ExpressionEditorState {
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  row.children.splice(index, 1, atomForToken(token), cursorPlaceholder());
  return createEditorWith(root, [...rowPath, index + 1]);
}

function insertFraction(state: ExpressionEditorState): ExpressionEditorState {
  const fraction: FractionNode = {
    id: createId(),
    type: 'fraction',
    numerator: emptyRow(),
    denominator: emptyRow(),
  };
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  row.children.splice(index, 1, fraction, cursorPlaceholder());
  return createEditorWith(root, [...rowPath, index, 'numerator', 0]);
}

function insertSqrt(state: ExpressionEditorState): ExpressionEditorState {
  const sqrt: SqrtNode = {
    id: createId(),
    type: 'sqrt',
    value: emptyRow(),
  };
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  row.children.splice(index, 1, sqrt, cursorPlaceholder());
  return createEditorWith(root, [...rowPath, index, 'value', 0]);
}

function insertGroup(state: ExpressionEditorState): ExpressionEditorState {
  const group: GroupNode = {
    id: createId(),
    type: 'group',
    body: emptyRow(),
  };
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  row.children.splice(index, 1, group, cursorPlaceholder());
  return createEditorWith(root, [...rowPath, index, 'body', 0]);
}

function insertFunction(state: ExpressionEditorState, name: 'sin' | 'cos'): ExpressionEditorState {
  const fn: FunctionNode = {
    id: createId(),
    type: 'function',
    name,
    argument: emptyRow(),
  };
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  row.children.splice(index, 1, fn, cursorPlaceholder());
  return createEditorWith(root, [...rowPath, index, 'argument', 0]);
}

function numberRow(value: string): RowNode {
  return {
    type: 'row',
    children: [...value].map((char) => atomForToken(char)),
  };
}

function insertPower(state: ExpressionEditorState, exponentValue?: string): ExpressionEditorState {
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  const hasBase = index > 0;
  const base = hasBase ? { type: 'row' as const, children: [row.children[index - 1]] } : emptyRow();
  const exponent = exponentValue ? { type: 'row' as const, children: [...numberRow(exponentValue).children, cursorPlaceholder()] } : emptyRow();
  const power: PowerNode = {
    id: createId(),
    type: 'power',
    base,
    exponent,
  };

  if (hasBase) {
    row.children.splice(index - 1, 2, power, cursorPlaceholder());
    const powerPath = [...rowPath, index - 1];
    return createEditorWith(root, exponentValue ? [...rowPath, index] : [...powerPath, 'exponent', 0]);
  }

  row.children.splice(index, 1, power, cursorPlaceholder());
  const powerPath = [...rowPath, index];
  return createEditorWith(root, exponentValue ? [...rowPath, index + 1] : [...powerPath, 'exponent', 0]);
}

export function insertExpressionToken(state: ExpressionEditorState, token: string): ExpressionEditorState {
  if (token === 'fraction-box') {
    return insertFraction(state);
  }
  if (token === 'sqrt-box') {
    return insertSqrt(state);
  }
  if (token === 'power-box') {
    return insertPower(state);
  }
  if (token === 'sin-box') {
    return insertFunction(state, 'sin');
  }
  if (token === 'cos-box') {
    return insertFunction(state, 'cos');
  }
  if (token === '^{2}') {
    return insertPower(state, '2');
  }
  if (token === '^{3}') {
    return insertPower(state, '3');
  }
  if (token === '(') {
    return insertGroup(state);
  }
  if (token === ')') {
    return navigateExpression(state, 'right');
  }
  return insertAtom(state, token);
}

function collectPlaceholderPaths(row: RowNode, rowPath: ExpressionPath = []): ExpressionPath[] {
  return row.children.flatMap((node, index) => {
    const nodePath = [...rowPath, index];
    if (node.type === 'placeholder') {
      return [nodePath];
    }
    if (node.type === 'fraction') {
      return [
        ...collectPlaceholderPaths(node.numerator, [...nodePath, 'numerator']),
        ...collectPlaceholderPaths(node.denominator, [...nodePath, 'denominator']),
      ];
    }
    if (node.type === 'sqrt') {
      return collectPlaceholderPaths(node.value, [...nodePath, 'value']);
    }
    if (node.type === 'power') {
      return [...collectPlaceholderPaths(node.base, [...nodePath, 'base']), ...collectPlaceholderPaths(node.exponent, [...nodePath, 'exponent'])];
    }
    if (node.type === 'group') {
      return collectPlaceholderPaths(node.body, [...nodePath, 'body']);
    }
    if (node.type === 'function') {
      return collectPlaceholderPaths(node.argument, [...nodePath, 'argument']);
    }
    return [];
  });
}

function findContainingStructurePath(rowPath: ExpressionPath): { parentRowPath: ExpressionPath; nodeIndex: number; field: ExpressionPathSegment } | undefined {
  if (rowPath.length < 2) {
    return undefined;
  }

  const field = rowPath[rowPath.length - 1];
  const nodeIndex = rowPath[rowPath.length - 2];
  if (typeof nodeIndex !== 'number') {
    return undefined;
  }

  return {
    parentRowPath: rowPath.slice(0, -2),
    nodeIndex,
    field,
  };
}

function findNearestFractionPath(
  root: RowNode,
  rowPath: ExpressionPath,
): { parentRowPath: ExpressionPath; nodeIndex: number; field: 'numerator' | 'denominator'; node: FractionNode } | undefined {
  for (let index = rowPath.length; index >= 2; index -= 2) {
    const field = rowPath[index - 1];
    const nodeIndex = rowPath[index - 2];

    if ((field !== 'numerator' && field !== 'denominator') || typeof nodeIndex !== 'number') {
      continue;
    }

    const parentRowPath = rowPath.slice(0, index - 2);
    const parentRow = getExpressionRow(root, parentRowPath);
    const node = parentRow.children[nodeIndex];

    if (node?.type === 'fraction') {
      return { parentRowPath, nodeIndex, field, node };
    }
  }

  return undefined;
}

function findPlaceholderInRow(row: RowNode, rowPath: ExpressionPath, preferredIndex = row.children.length - 1): ExpressionPath {
  const clampedIndex = Math.max(0, Math.min(preferredIndex, row.children.length - 1));
  const exact = row.children[clampedIndex];
  if (exact?.type === 'placeholder') {
    return [...rowPath, clampedIndex];
  }

  const placeholderIndex = row.children.findIndex((node) => node.type === 'placeholder');
  return [...rowPath, placeholderIndex >= 0 ? placeholderIndex : row.children.length - 1];
}

function movePlaceholderToIndex(row: RowNode, rowPath: ExpressionPath, targetIndex: number): ExpressionPath {
  const placeholderIndex = row.children.findIndex((node) => node.type === 'placeholder');
  const clampedTargetIndex = Math.max(0, Math.min(targetIndex, row.children.length));

  if (placeholderIndex < 0) {
    row.children.splice(clampedTargetIndex, 0, cursorPlaceholder());
    return [...rowPath, clampedTargetIndex];
  }

  const [cursor] = row.children.splice(placeholderIndex, 1);
  const adjustedTargetIndex = placeholderIndex < clampedTargetIndex ? clampedTargetIndex - 1 : clampedTargetIndex;
  row.children.splice(adjustedTargetIndex, 0, cursor);
  return [...rowPath, adjustedTargetIndex];
}

function getEntryPathFromLeft(node: ExpressionNode, nodePath: ExpressionPath): ExpressionPath | undefined {
  if (node.type === 'fraction') {
    return findPlaceholderInRow(node.numerator, [...nodePath, 'numerator'], 0);
  }
  if (node.type === 'sqrt') {
    return findPlaceholderInRow(node.value, [...nodePath, 'value'], 0);
  }
  if (node.type === 'power') {
    return findPlaceholderInRow(node.base, [...nodePath, 'base'], 0);
  }
  if (node.type === 'group') {
    return findPlaceholderInRow(node.body, [...nodePath, 'body'], 0);
  }
  if (node.type === 'function') {
    return findPlaceholderInRow(node.argument, [...nodePath, 'argument'], 0);
  }
  return undefined;
}

function getEntryPathFromRight(node: ExpressionNode, nodePath: ExpressionPath): ExpressionPath | undefined {
  if (node.type === 'fraction') {
    return findPlaceholderInRow(node.denominator, [...nodePath, 'denominator']);
  }
  if (node.type === 'sqrt') {
    return findPlaceholderInRow(node.value, [...nodePath, 'value']);
  }
  if (node.type === 'power') {
    return findPlaceholderInRow(node.exponent, [...nodePath, 'exponent']);
  }
  if (node.type === 'group') {
    return findPlaceholderInRow(node.body, [...nodePath, 'body']);
  }
  if (node.type === 'function') {
    return findPlaceholderInRow(node.argument, [...nodePath, 'argument']);
  }
  return undefined;
}

function moveToNextPlaceholder(state: ExpressionEditorState, direction: 1 | -1 = 1): ExpressionEditorState {
  const placeholders = collectPlaceholderPaths(state.root);
  if (placeholders.length === 0) {
    return state;
  }

  const currentIndex = placeholders.findIndex((path) => isSameExpressionPath(path, state.cursorPath));
  const nextIndex =
    currentIndex < 0
      ? 0
      : (currentIndex + direction + placeholders.length) % placeholders.length;
  return { ...state, cursorPath: placeholders[nextIndex] };
}

function moveRight(state: ExpressionEditorState): ExpressionEditorState {
  const root = cloneRow(state.root);
  const { rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  const row = getExpressionRow(root, rowPath);

  if (index < row.children.length - 1) {
    const nextNode = row.children[index + 1];
    const entryPath = getEntryPathFromLeft(nextNode, [...rowPath, index + 1]);
    if (entryPath) {
      return createEditorWith(root, entryPath);
    }

    const cursor = row.children[index];
    row.children[index] = row.children[index + 1];
    row.children[index + 1] = cursor;
    return createEditorWith(root, [...rowPath, index + 1]);
  }

  const containing = findContainingStructurePath(rowPath);
  if (!containing) {
    return state;
  }

  const parentRow = getExpressionRow(root, containing.parentRowPath);
  return createEditorWith(root, movePlaceholderToIndex(parentRow, containing.parentRowPath, containing.nodeIndex + 1));
}

function moveLeft(state: ExpressionEditorState): ExpressionEditorState {
  const root = cloneRow(state.root);
  const { rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);
  const row = getExpressionRow(root, rowPath);

  if (index > 0) {
    const previousNode = row.children[index - 1];
    const entryPath = getEntryPathFromRight(previousNode, [...rowPath, index - 1]);
    if (entryPath) {
      return createEditorWith(root, entryPath);
    }

    const cursor = row.children[index];
    row.children[index] = row.children[index - 1];
    row.children[index - 1] = cursor;
    return createEditorWith(root, [...rowPath, index - 1]);
  }

  const containing = findContainingStructurePath(rowPath);
  if (!containing) {
    return state;
  }

  const parentRow = getExpressionRow(root, containing.parentRowPath);
  return createEditorWith(root, movePlaceholderToIndex(parentRow, containing.parentRowPath, containing.nodeIndex));
}

function moveVertical(state: ExpressionEditorState, direction: 'up' | 'down'): ExpressionEditorState {
  const rowPath = getParentRowPath(state.cursorPath);
  const fraction = findNearestFractionPath(state.root, rowPath);
  if (!fraction) {
    return state;
  }

  if (direction === 'down' && fraction.field === 'numerator') {
    return { ...state, cursorPath: findPlaceholderInRow(fraction.node.denominator, [...fraction.parentRowPath, fraction.nodeIndex, 'denominator']) };
  }

  if (direction === 'up' && fraction.field === 'denominator') {
    return { ...state, cursorPath: findPlaceholderInRow(fraction.node.numerator, [...fraction.parentRowPath, fraction.nodeIndex, 'numerator']) };
  }

  return state;
}

export function navigateExpression(state: ExpressionEditorState, action: ExpressionNavigationAction): ExpressionEditorState {
  if (action === 'left') {
    return moveLeft(state);
  }
  if (action === 'right') {
    return moveRight(state);
  }
  if (action === 'up') {
    return moveVertical(state, 'up');
  }
  if (action === 'down') {
    return moveVertical(state, 'down');
  }
  return moveToNextPlaceholder(state, 1);
}

export function backspaceExpression(state: ExpressionEditorState): ExpressionEditorState {
  const root = cloneRow(state.root);
  const { row, rowPath, index } = getActiveRowAndIndex(root, state.cursorPath);

  if (index > 0) {
    row.children.splice(index - 1, 1);
    return createEditorWith(root, [...rowPath, index - 1]);
  }

  if (row.children.length === 1) {
    const containing = findContainingStructurePath(rowPath);
    if (containing) {
      const parentRow = getExpressionRow(root, containing.parentRowPath);
      parentRow.children.splice(containing.nodeIndex, 1);
      const cursorPath = findPlaceholderInRow(parentRow, containing.parentRowPath, containing.nodeIndex);
      return createEditorWith(root, cursorPath);
    }
  }

  return moveLeft(state);
}

export function setExpressionCursor(state: ExpressionEditorState, cursorPath: ExpressionPath): ExpressionEditorState {
  return { ...state, cursorPath };
}

export function moveExpressionCursorToEnd(state: ExpressionEditorState): ExpressionEditorState {
  const root = cloneRow(state.root);
  const rootPlaceholderPath = findPlaceholderInRow(root, [], root.children.length - 1);
  return { root, cursorPath: rootPlaceholderPath };
}
