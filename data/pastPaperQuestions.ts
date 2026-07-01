import { topicLessons } from '@/data/lessonContent';
import { PastPaperQuestion, TopicId } from '@/types/maths';

type PastPaperSourceQuestion = {
  id: string;
  year: number;
  paper: 1 | 2;
  questionNumber: number;
  questionLatex: string;
  answerLatex: string;
  parts: PastPaperSourceQuestionPart[];
  topic: string;
  subtopic: string;
  calculator: boolean;
  graphicRequired: boolean;
  graphicDescription: string;
  sourceImage: string;
  markSchemeImage: string;
  reviewStatus: PastPaperQuestion['reviewStatus'];
};

type PastPaperSourceQuestionPart = {
  label: string;
  answerable: boolean;
  choices?: string[];
  answerLatex: string;
};

export type PastPaperFilter = {
  topicIds?: TopicId[];
  years?: number[];
  papers?: PastPaperQuestion['paper'][];
  limit?: number;
};

export type FullPastPaperOption = {
  id: string;
  year: number;
  paper: PastPaperQuestion['paper'];
  questionCount: number;
  durationMinutes: number;
};

const paperDurations: Record<PastPaperQuestion['paper'], number> = {
  1: 75,
  2: 90,
};

const sourcePastPaperQuestions: PastPaperSourceQuestion[] = [
  {
    id: 'H-2025-P1-01',
    year: 2025,
    paper: 1,
    questionNumber: 1,
    questionLatex: 'A curve has equation $y= x^3 -2x^2 +5$.\nFind the equation of the tangent to this curve at the point where $x = 2$.',
    answerLatex: '$y = 4x - 3$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$y = 4x - 3$' }],
    topic: 'Differentiation',
    subtopic: 'Tangents',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-01.jpg',
    markSchemeImage: 'images/H-2025-P1-01_ms.jpg',
    reviewStatus: 'reviewed',
  },
  {
    id: 'H-2025-P1-02',
    year: 2025,
    paper: 1,
    questionNumber: 2,
    questionLatex: 'Find the equation of the perpendicular bisector of the line joining $A(1, 4)$ and $B (9, 10)$.',
    answerLatex: '$3y = -4x + 41$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$3y = -4x + 41$' }],
    topic: 'Coordinate geometry',
    subtopic: 'Straight lines',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-02.jpg',
    markSchemeImage: 'images/H-2025-P1-02_ms.jpg',
    reviewStatus: 'reviewed',
  },
  {
    id: 'H-2025-P1-03',
    year: 2025,
    paper: 1,
    questionNumber: 3,
    questionLatex: 'Find $\\int (\\frac{12}{x^2}+x^{\\frac{1}{2}})\\,dx$',
    answerLatex: '$-12x^{-1} + (\\frac{2}{3})x^{\\frac{3}{2}} + C$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$-12x^{-1} + (\\frac{2}{3})x^{\\frac{3}{2}} + C$' }],
    topic: 'Integration',
    subtopic: 'Integration',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-03.jpg',
    markSchemeImage: 'images/H-2025-P1-03_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-04',
    year: 2025,
    paper: 1,
    questionNumber: 4,
    questionLatex: 'Evaluate $3\\log_3(2)+\\log_3(\\frac{1}{24})$',
    answerLatex: '$-1$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$-1$' }],
    topic: 'Logs and exponentials',
    subtopic: 'Logarithms',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-04.jpg',
    markSchemeImage: 'images/H-2025-P1-04_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-05',
    year: 2025,
    paper: 1,
    questionNumber: 5,
    questionLatex: 'The diagram shows the graph of $y = f(x)$, with stationary points at $(0, 3)$ and $(4, 0)$. Sketch the graph of $y= f(-x) + 3$',
    answerLatex: 'Sketch complete',
    parts: [{ label: 'Answer', answerable: false, answerLatex: 'Sketch complete' }],
    topic: 'Trigonometry',
    subtopic: 'Trigonometric equations',
    calculator: false,
    graphicRequired: true,
    graphicDescription: 'Recreate the axes or blank answer layout needed for the requested sketch, including any labelled intercepts, turning points, asymptotes, or constraints stated in the question.',
    sourceImage: 'images/H-2025-P1-05.jpg',
    markSchemeImage: 'images/H-2025-P1-05_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-06',
    year: 2025,
    paper: 1,
    questionNumber: 6,
    questionLatex: 'The diagram shows a right-angled triangle with angle $q$.(a) Determine the value of: i) $sin2q$ ii) $cos2q$, A second right-angled traingle has angle $r$ as shown. b) find the value of $sin(2q-r)$',
    answerLatex: '(a) (i) $\\frac{5}{13}$ (ii) $\\frac{12}{13}$ \n(b) $\\frac{8}{13}sqrt17$',
    parts: [
      { label: '(a)(i)', answerable: true, answerLatex: '$\\frac{5}{13}$' },
      { label: '(a)(ii)', answerable: true, answerLatex: '$\\frac{12}{13}$' },
      { label: '(b)', answerable: true, answerLatex: '$\\frac{8}{13}sqrt17$' },
    ],
    topic: 'Trigonometry',
    subtopic: 'Double angle formulae',
    calculator: false,
    graphicRequired: true,
    graphicDescription: 'Recreate the mathematical diagram with all given labels, lengths, angles, coordinates, and relationships needed to answer the question.',
    sourceImage: 'images/H-2025-P1-06.jpg',
    markSchemeImage: 'images/H-2025-P1-06_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-07',
    year: 2025,
    paper: 1,
    questionNumber: 7,
    questionLatex: '(a) Show that $(x+3)$ is a factor of $5x^3 +16x^2 -x-12$.(b) Hence, or otherwise, solve $5x^3 +16x^2 -x-12=0$.',
    answerLatex: '(a) result shown \n(b) $x = -3$, $x = -1$, $x = \\frac{4}{5}$',
    parts: [
      { label: '(a)', answerable: false, answerLatex: 'result shown' },
      { label: '(b)', answerable: true, answerLatex: '$x = -3$, $x = -1$, $x = \\frac{4}{5}$' },
    ],
    topic: 'Algebra',
    subtopic: 'Polynomials',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-07.jpg',
    markSchemeImage: 'images/H-2025-P1-07_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-08',
    year: 2025,
    paper: 1,
    questionNumber: 8,
    questionLatex: 'Given that $\\log_a 75 = 2 + \\log_a 3$, $a > 0$, find the value of $a$.',
    answerLatex: '$a = 5$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$a = 5$' }],
    topic: 'Logs and exponentials',
    subtopic: 'Logarithms',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-08.jpg',
    markSchemeImage: 'images/H-2025-P1-08_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P1-09',
    year: 2025,
    paper: 1,
    questionNumber: 9,
    questionLatex: 'Find the coordinates of the points of intersection of the line with equation $y=x+1$ and the circle with equation $x^2 + y^2 -2x + 6y - 15 = 0$',
    answerLatex: '$(-4, -3)$ and $(1, 2)$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$(-4, -3)$ and $(1, 2)$' }],
    topic: 'Coordinate geometry',
    subtopic: 'Circles',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-09.jpg',
    markSchemeImage: 'images/H-2025-P1-09_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-10',
    year: 2025,
    paper: 1,
    questionNumber: 10,
    questionLatex: 'The vectors $u$ and $v$ are such that $\\mathbf{u}=\\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix},\\quad\\mathbf{v}=\\begin{pmatrix}1\\\\3\\\\k\\end{pmatrix}.$ The angle between $u$ and $v$ is $45^\\circ$. Find the value of $k$, where $k > 0$.',
    answerLatex: '$k = sqrt6$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$k = sqrt6$' }],
    topic: 'Vectors',
    subtopic: 'Scalar product',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-10.jpg',
    markSchemeImage: 'images/H-2025-P1-10_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P1-11',
    year: 2025,
    paper: 1,
    questionNumber: 11,
    questionLatex: 'The equation $9x^2 + 3kx + k =0$ has two real and distinct roots.\nDetermine the range of values for k.\nJustify your answer.',
    answerLatex: '$k<0$ and $k>4$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$k<0$ and $k>4$' }],
    topic: 'Algebra',
    subtopic: 'Quadratics',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-11.jpg',
    markSchemeImage: 'images/H-2025-P1-11_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P1-12',
    year: 2025,
    paper: 1,
    questionNumber: 12,
    questionLatex: 'A curve has gradient function $\\frac{dy}{dx}=6\\cos x+8\\sin 2x$.\nThe curve passes through the point $(0,-1)$.\nFind the equation of the curve.',
    answerLatex: '$y = 6\\sin x - 4\\cos 2x + 3$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$y = 6\\sin x - 4\\cos 2x + 3$' }],
    topic: 'Integration',
    subtopic: 'Trigonometric integration',
    calculator: false,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P1-12.jpg',
    markSchemeImage: 'images/H-2025-P1-12_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P1-13',
    year: 2025,
    paper: 1,
    questionNumber: 13,
    questionLatex: 'A function $f$ is defined on the set of real numbers. The derivative of $f$ is $f\'(x)=(x+5)(2-x)$.\n\n(a) Find the $x$-coordinates of the stationary points on the curve with equation $y=f(x)$ and determine their nature.\n\nIt is known that $f$ is a cubic function, $f(0)<0$, and the equation $f(x)=0$ has exactly one solution. The solution lies between $-10$ and $10$.\n\n(b) Draw a sketch of a possible graph of $y=f(x)$.',
    answerLatex: '(a) minimum at $x = -5$, maximum at $x = 2$ \n(b) graph drawn',
    parts: [
      {
        label: '(a)',
        answerable: true,
        choices: [
          'minimum at $x = -5$, maximum at $x = 2$',
          'maximum at $x = -5$, minimum at $x = 2$',
          'minimum at $x = 5$, maximum at $x = -2$',
          'maximum at $x = 5$, minimum at $x = -2$',
        ],
        answerLatex: 'minimum at $x = -5$, maximum at $x = 2$',
      },
      { label: '(b)', answerable: false, answerLatex: 'graph drawn' },
    ],
    topic: 'Differentiation',
    subtopic: 'Stationary points',
    calculator: false,
    graphicRequired: false,
    graphicDescription: 'Recreate the axes or blank answer layout needed for the requested sketch, including any labelled intercepts, turning points, asymptotes, or constraints stated in the question.',
    sourceImage: 'images/H-2025-P1-13.jpg',
    markSchemeImage: 'images/H-2025-P1-13_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P2-01',
    year: 2025,
    paper: 2,
    questionNumber: 1,
    questionLatex: 'Triangle $ABC$ has vertices $A (-9, -14)$, $B(9, 20)$ and $C (21, -24)$. a) Find the equation of the altitude through $B$. \n(b) Find the equation of the median through $A$. 3\n\n(c) Determine the point of intersection of the altitude through $B$ and the median through $A$.',
    answerLatex: '(a) $y = 3x - 7$ \n(b) $2y = x - 19$ \n(c) $(-1, -10)$',
    parts: [
      { label: '(a)', answerable: true, answerLatex: '$y = 3x - 7$' },
      { label: '(b)', answerable: true, answerLatex: '$2y = x - 19$' },
      { label: '(c)', answerable: true, answerLatex: '$(-1, -10)$' },
    ],
    topic: 'Coordinate geometry',
    subtopic: 'Straight lines',
    calculator: true,
    graphicRequired: true,
    graphicDescription: 'Recreate the visual layout from the question image that contains information needed to answer the question.',
    sourceImage: 'images/H-2025-P2-01.jpg',
    markSchemeImage: 'images/H-2025-P2-01_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P2-02',
    year: 2025,
    paper: 2,
    questionNumber: 2,
    questionLatex: 'Express $2x^2 +16x+5$ in the form $p(x+q)^2+r$.',
    answerLatex: '$2(x + 4)² - 27$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$2(x + 4)² - 27$' }],
    topic: 'Algebra',
    subtopic: 'Completing the square',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-02.jpg',
    markSchemeImage: 'images/H-2025-P2-02_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P2-03',
    year: 2025,
    paper: 2,
    questionNumber: 3,
    questionLatex: 'The diagram shows the graph of $y = x^2 -2x+3$. Calculate the shaded area ',
    answerLatex: '$\\frac{38}{3}$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$\\frac{38}{3}$' }],
    topic: 'Integration',
    subtopic: 'Area under curves',
    calculator: true,
    graphicRequired: true,
    graphicDescription: 'Recreate the graph or coordinate axes with all labels, plotted points, curves, and scale information needed to answer the question.',
    sourceImage: 'images/H-2025-P2-03.jpg',
    markSchemeImage: 'images/H-2025-P2-03_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P2-04',
    year: 2025,
    paper: 2,
    questionNumber: 4,
    questionLatex: 'A function, $g$, is defined by $g(x) = (x-4)^3$, where $x \\in \\mathbb{R}$.\nFind the inverse function, $g^{-1}(x)$.',
    answerLatex: '$g^{-1}(x) = (\\sqrt[3]{x}) + 4$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$g^{-1}(x) = (\\sqrt[3]{x}) + 4$' }],
    topic: 'Functions',
    subtopic: 'Inverse functions',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-04.jpg',
    markSchemeImage: 'images/H-2025-P2-04_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-05',
    year: 2025,
    paper: 2,
    questionNumber: 5,
    questionLatex: '(a) Show that the points $A(-3, 2,-1)$, $B (6, -1, 5)$ and $C (12, -3, 9)$ are collinear. 3\n\n(b) State the ratio in which $B$ divides $AC$. 1',
    answerLatex: '(a) result shown \n(b) $3:2$',
    parts: [
      { label: '(a)', answerable: false, answerLatex: 'result shown' },
      { label: '(b)', answerable: true, answerLatex: '$3:2$' },
    ],
    topic: 'Vectors',
    subtopic: 'Collinearity',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-05.jpg',
    markSchemeImage: 'images/H-2025-P2-05_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-06',
    year: 2025,
    paper: 2,
    questionNumber: 6,
    questionLatex: '(a) Express $5\\cos x-9\\sin x$ in the form $k \\cos(x+a)$ where $k > 0$ and $0<a<2\\pi$. 4\n\n(b) Hence solve $5\\cos x-9\\sin x=7$ for $0<x<2\\pi$.',
    answerLatex: '(a) $sqrt106 \\cos (x + 1.06...)$ \n(b) $x = 4.396$, $x = 6.04$',
    parts: [
      { label: '(a)', answerable: true, answerLatex: '$sqrt106 \\cos (x + 1.06...)$' },
      { label: '(b)', answerable: true, answerLatex: '$x = 4.396$, $x = 6.04$' },
    ],
    topic: 'Trigonometry',
    subtopic: 'Trigonometric equations',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-06.jpg',
    markSchemeImage: 'images/H-2025-P2-06_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-07',
    year: 2025,
    paper: 2,
    questionNumber: 7,
    questionLatex: 'Find $\\int (3x+2)^7\\,dx$',
    answerLatex: '$(3x + 2)^{8} / 24 + C$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$(3x + 2)^{8} / 24 + C$' }],
    topic: 'Integration',
    subtopic: 'Integration',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-07.jpg',
    markSchemeImage: 'images/H-2025-P2-07_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-08',
    year: 2025,
    paper: 2,
    questionNumber: 8,
    questionLatex: '$E,ABCD$ is a rectangular-based pyramid as shown.\n$AD = 61+ 4j+2k$\n$DC = 2i-4j+2k$\n$DE =-4i-3j+4k$.Express $BE$ in terms of $i$, $j$ and $k$.',
    answerLatex: '$5j + 4k$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$5j + 4k$' }],
    topic: 'Mixed',
    subtopic: 'Vector pathways in geometric diagrams',
    calculator: true,
    graphicRequired: true,
    graphicDescription: 'Recreate the mathematical diagram with all given labels, lengths, angles, coordinates, and relationships needed to answer the question.',
    sourceImage: 'images/H-2025-P2-08.jpg',
    markSchemeImage: 'images/H-2025-P2-08_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
  {
    id: 'H-2025-P2-09',
    year: 2025,
    paper: 2,
    questionNumber: 9,
    questionLatex: 'A sequence satisfies the recurrence relation $u_{n+1}= mu_n +4$, where $m$ is a constant.\n\n(a) The sequence approaches a limit of $10$ as $n$ approaches infinity.\n\nDetermine the value of $m$. \n\n(b) Given that $u$, = $19$, calculate the value of $1$.',
    answerLatex: '(a) $m = \\frac{3}{5}$ \n(b) $25$',
    parts: [
      { label: '(a)', answerable: true, answerLatex: '$m = \\frac{3}{5}$' },
      { label: '(b)', answerable: true, answerLatex: '$25$' },
    ],
    topic: 'Mixed',
    subtopic: 'Find a specific term of a recurrence relation limits of recurrence relations',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-09.jpg',
    markSchemeImage: 'images/H-2025-P2-09_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-10',
    year: 2025,
    paper: 2,
    questionNumber: 10,
    questionLatex: 'A hotel owner is designing signs showing the room numbers.\nEach sign is a rectangle with a right-angled triangle above it.\nThe length and breadth of the rectangle are $5x$ centimetres and $y$ centimetres\nrespectively.\nThe shorter sides of the triangle are $3x$ centimetres and $4x$ centimetres. The area of the sign is $150$ square centimetres.\n\n(a) Show that the perimeter, $P$ cm, of the sign is given by\n\n$P=9.6x+ \\frac{60}{x}$. Each sign will be lit using a lighting strip placed around its perimeter.\nThe hotel owner requires the perimeter, $P$, of the sign to be as small as possible.\n\n(b) Find the minimum value of $P$.',
    answerLatex: '(a) result shown \n(b) $48$ cm',
    parts: [
      { label: '(a)', answerable: false, answerLatex: 'result shown' },
      { label: '(b)', answerable: true, answerLatex: '$48$ cm' },
    ],
    topic: 'Mixed',
    subtopic: 'Optimisation',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-10.jpg',
    markSchemeImage: 'images/H-2025-P2-10_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-11',
    year: 2025,
    paper: 2,
    questionNumber: 11,
    questionLatex: 'Solve $3sin 2x°+4cosx° = 0$ for $0< x < 360$.',
    answerLatex: '$x = 90°$, $221.8°$, $270°$, $318.1°$',
    parts: [{ label: 'Answer', answerable: true, answerLatex: '$x = 90°$, $221.8°$, $270°$, $318.1°$' }],
    topic: 'Trigonometry',
    subtopic: 'Trigonometric equations',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-11.jpg',
    markSchemeImage: 'images/H-2025-P2-11_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-12',
    year: 2025,
    paper: 2,
    questionNumber: 12,
    questionLatex: 'Functions $f$ and $g$ are defined on the set of real numbers by:$f(x) = x^5 + 3$, $g(x) = 1 - x^3$\n(a) Find an expression for $h(x)$, where $h(x)= f(g (x))$. 2\n\n(b) Find $h\'(x)$',
    answerLatex: '(a) $(1 - x³)^{5} + 3$ \n(b) $-15x²(1 - x³)^{4}$',
    parts: [
      { label: '(a)', answerable: true, answerLatex: '$(1 - x³)^{5} + 3$' },
      { label: '(b)', answerable: true, answerLatex: '$-15x²(1 - x³)^{4}$' },
    ],
    topic: 'Mixed',
    subtopic: 'Composite functions differentiate or evaluate derivative composite function',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-12.jpg',
    markSchemeImage: 'images/H-2025-P2-12_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-13',
    year: 2025,
    paper: 2,
    questionNumber: 13,
    questionLatex: 'A radioactive substance, which has been collected, decays over time.\nThe mass of the radioactive substance remaining is modelled by\n$M =150e^{-0.0054t}$\n\nwhere $M$ is the mass, in micrograms, $t$ years after the radioactive substance was\ncollected.\n\n(a) Determine the initial mass of the radioactive substance. 1\n\n(b) Calculate the time taken for the mass of the radioactive substance to decay to\n\n$120$ micrograms.',
    answerLatex: '(a) $150$ micrograms \n(b) $41.32$ years',
    parts: [
      { label: '(a)', answerable: true, answerLatex: '$150$ micrograms' },
      { label: '(b)', answerable: true, answerLatex: '$41.32$ years' },
    ],
    topic: 'Mixed',
    subtopic: 'Solving equations where the unknown is in the exponent',
    calculator: true,
    graphicRequired: false,
    graphicDescription: '',
    sourceImage: 'images/H-2025-P2-13.jpg',
    markSchemeImage: 'images/H-2025-P2-13_ms.jpg',
    reviewStatus: 'needs_review',
  },
  {
    id: 'H-2025-P2-14',
    year: 2025,
    paper: 2,
    questionNumber: 14,
    questionLatex: 'Circle $C$, has equation $(x+5) +(y-6) =9$.\n\n(a) State the centre and radius of $C$,. 2\nCircle $C$, has equation $x^2 + y^2 -14x+6y+54=0$.\n\n(b) State the centre and radius of $C$.\nCircles $C_1$ $C_2$, and $C_3$, are touching as shown in the diagram.\nThe centre of circle $C$, lies on the line joining the centres of $C_1$, and $C_2$(c) Determine the equation of $C$. 3',
    answerLatex: '(a) $(-5, 6)$ and $r = 3$ \n(b) $(7, -3)$ and $r = 2$ \n(c) $(x + 1)² + (y - 3)² = 64$',
    parts: [
      { label: '(a)', answerable: true, answerLatex: '$(-5, 6)$ and $r = 3$' },
      { label: '(b)', answerable: true, answerLatex: '$(7, -3)$ and $r = 2$' },
      { label: '(c)', answerable: true, answerLatex: '$(x + 1)² + (y - 3)² = 64$' },
    ],
    topic: 'Coordinate geometry',
    subtopic: 'Circles',
    calculator: true,
    graphicRequired: true,
    graphicDescription: 'Recreate the mathematical diagram with all given labels, lengths, angles, coordinates, and relationships needed to answer the question.',
    sourceImage: 'images/H-2025-P2-14.jpg',
    markSchemeImage: 'images/H-2025-P2-14_ms.jpg',
    reviewStatus: 'needs_manual_review',
  },
];

export const pastPaperQuestions: PastPaperQuestion[] = sourcePastPaperQuestions.map((question) => {
  const { topic, ...rest } = question;

  return {
    ...rest,
    source: 'past-paper',
    sourceTopic: topic,
    topicId: mapSourceTopic(topic, question.subtopic),
    type: 'typed-answer',
    prompt: question.questionLatex.replace(/\\n/g, '\n'),
    answer: question.answerLatex,
    answerType: 'text',
    acceptedAnswers: [question.answerLatex],
    parts: question.parts.map((part, index) => ({
      id: `${question.id}-part-${index + 1}`,
      label: part.label,
      answerable: part.answerable,
      choices: part.choices,
      answer: part.answerLatex.replace(/\\n/g, '\n'),
      answerType: 'text',
      acceptedAnswers: [part.answerLatex.replace(/\\n/g, '\n')],
    })),
    hint: question.graphicRequired && question.graphicDescription ? question.graphicDescription : `Past paper ${question.year} Paper ${question.paper}, Question ${question.questionNumber}.`,
    workedSolution: question.answerLatex.replace(/\\n/g, '\n'),
  };
});

export function getPastPaperQuestions(filter: PastPaperFilter = {}) {
  const { topicIds, years, papers, limit } = filter;

  const questions = pastPaperQuestions.filter((question) => {
    const matchesTopic = !topicIds?.length || topicIds.includes(question.topicId);
    const matchesYear = !years?.length || years.includes(question.year);
    const matchesPaper = !papers?.length || papers.includes(question.paper);

    return matchesTopic && matchesYear && matchesPaper;
  });

  return typeof limit === 'number' ? questions.slice(0, limit) : questions;
}

export function getPracticePastPaperQuestions(filter: PastPaperFilter = {}) {
  const { limit, ...questionFilter } = filter;
  const questions = getPastPaperQuestions(questionFilter).filter(isPracticeReadyPastPaperQuestion);

  return typeof limit === 'number' ? questions.slice(0, limit) : questions;
}

export function getPastPaperQuestionsForTopic(topicId: TopicId) {
  return getPracticePastPaperQuestions({ topicIds: [topicId] });
}

export function getAvailablePastPaperYears() {
  return uniqueSorted(pastPaperQuestions.map((question) => question.year));
}

export function getAvailablePastPaperPapers() {
  return uniqueSorted(pastPaperQuestions.map((question) => question.paper));
}

export function getFullPastPaperOptions(): FullPastPaperOption[] {
  const paperMap = new Map<string, FullPastPaperOption>();

  pastPaperQuestions.forEach((question) => {
    const id = getFullPastPaperId(question.year, question.paper);
    const option = paperMap.get(id);

    if (option) {
      option.questionCount += 1;
      return;
    }

    paperMap.set(id, {
      id,
      year: question.year,
      paper: question.paper,
      questionCount: 1,
      durationMinutes: paperDurations[question.paper],
    });
  });

  return [...paperMap.values()].sort((left, right) => right.year - left.year || left.paper - right.paper);
}

export function getFullPastPaperQuestions(year: number, paper: PastPaperQuestion['paper']) {
  return pastPaperQuestions
    .filter((question) => question.year === year && question.paper === paper)
    .sort((left, right) => left.questionNumber - right.questionNumber);
}

export function getFullPastPaperDurationMinutes(paper: PastPaperQuestion['paper']) {
  return paperDurations[paper];
}

export function getFullPastPaperId(year: number, paper: PastPaperQuestion['paper']) {
  return `${year}-paper-${paper}`;
}

function mapSourceTopic(topic: string, subtopic: string): TopicId {
  if (topic === 'Differentiation' || topic === 'Calculus') {
    return 'differentiation';
  }
  if (topic === 'Integration') {
    return 'integration';
  }
  if (topic === 'Logs and exponentials') {
    return 'logs-exponentials';
  }
  if (topic === 'Coordinate geometry') {
    return 'straight-line';
  }
  if (topic === 'Functions') {
    return 'functions';
  }
  if (subtopic === 'Polynomials') {
    return 'polynomials';
  }
  if (subtopic.includes('recurrence')) {
    return 'recurrence-relations';
  }
  if (subtopic.includes('Composite functions') || subtopic.includes('exponent')) {
    return 'functions';
  }

  return 'polynomials';
}

function isPracticeReadyPastPaperQuestion(question: PastPaperQuestion) {
  return topicLessons.some((topic) => topic.id === question.topicId);
}

function uniqueSorted<T extends number | string>(values: T[]) {
  return [...new Set(values)].sort((left, right) => {
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    return String(right).localeCompare(String(left));
  });
}
