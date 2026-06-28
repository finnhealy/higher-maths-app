import { TopicId, TopicLesson } from '@/types/maths';

export const topicLessons: TopicLesson[] = [
  {
    id: 'differentiation',
    title: 'Differentiation',
    icon: 'f′',
    colour: '#3B82F6',
    description: 'Gradients, stationary points, rates of change',
    subtopics: [
      {
        id: 'power-rule',
        title: 'Power rule',
        summary: 'Differentiate powers of x quickly and accurately.',
        intro: [
          'Differentiation finds the gradient function. This means it can be used to find the gradietn at every point on a graph.',
          'For Higher Maths, the power rule is the main rule used to differentiate expressions made from powers of x.',
          'Differentiate each term separately, then simplify.',
        ],
        example: {
          question: 'Differentiate $y=4x^5-3x^2+7x-9$.',
          solution: [
            '$4x^5$ becomes $20x^4$.',
            '$-3x^2$ becomes $-6x$, and $7x$ becomes $7$.',
            'The constant $-9$ disappears.',
            'So $\\frac{dy}{dx}=20x^4-6x+7$.',
          ],
        },
        check: {
          question: 'Differentiate $y=5x^4-2x^3+6$.',
          answer: '20x^3-6x^2',
          answerType: 'expression',
          acceptedAnswers: ['20x^3-6x^2', '20x^3 - 6x^2', '$20x^3-6x^2$'],
          solution: ['$5x^4$ becomes $20x^3$.', '$-2x^3$ becomes $-6x^2$.', 'The constant $6$ differentiates to $0$.'],
        },
        blocks: [
          { type: 'text', content: 'Multiply the coefficient by the power, then reduce the power by 1.' },
          { type: 'math', latex: '\\frac{d}{dx}(ax^n)=anx^{n-1}' },
          { type: 'text', content: 'Constants disappear because their gradient is 0.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Differentiate $y=4x^5-3x^2+7x-9$.',
            solution: [
              '$4x^5$ becomes $20x^4$.',
              '$-3x^2$ becomes $-6x$, and $7x$ becomes $7$.',
              'The constant $-9$ disappears.',
              'So $\\frac{dy}{dx}=20x^4-6x+7$.',
            ],
          },
        ],
      },
      {
        id: 'equation-of-tangent',
        title: 'Equation of tangent',
        summary: 'Use differentiation to find the gradient of a tangent.',
        intro: [
          'A tangent touches a curve at one point and has the same gradient as the curve there.',
          'First differentiate to get the gradient function.',
          'Then substitute the given $x$ value and use the straight line equation.',
        ],
        example: {
          question: 'Find the equation of the tangent to $y=x^2+3x$ at $x=2$.',
          solution: [
            '$\\frac{dy}{dx}=2x+3$, so at $x=2$ the gradient is $7$.',
            'The point on the curve is $y=2^2+3(2)=10$, so the point is $(2,10)$.',
            'Use $y-b=m(x-a)$: $y-10=7(x-2)$.',
            'So $y=7x-4$.',
          ],
        },
        check: {
          question: 'Find the equation of the tangent to $y=x^2+2x$ at $x=1$.',
          answer: 'y=4x-1',
          answerType: 'equation',
          acceptedAnswers: ['y=4x-1', 'y = 4x - 1', '$y=4x-1$'],
          solution: ['$\\frac{dy}{dx}=2x+2$, so at $x=1$ the gradient is $4$.', 'The point is $(1,3)$.', '$y-3=4(x-1)$, so $y=4x-1$.'],
        },
        blocks: [
          { type: 'text', content: 'Differentiate the curve to find the gradient function.' },
          { type: 'math', latex: 'm=\\left.\\frac{dy}{dx}\\right|_{x=a}' },
          { type: 'text', content: 'Find the point by substituting $x=a$ into the original curve, then use the line equation.' },
          { type: 'math', latex: 'y-b=m(x-a)' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the equation of the tangent to $y=x^2+3x$ at $x=2$.',
            solution: [
              '$\\frac{dy}{dx}=2x+3$, so at $x=2$ the gradient is $7$.',
              'The point on the curve is $y=10$, so the point is $(2,10)$.',
              '$y-10=7(x-2)$, so $y=7x-4$.',
            ],
          },
        ],
      },
      {
        id: 'stationary-points',
        title: 'Find stationary points',
        summary: 'Solve $\\frac{dy}{dx}=0$ and substitute back for $y$.',
        intro: [
          'A stationary point is where the curve is flat.',
          'Flat means the gradient is $0$.',
          'Find the $x$ value first, then put it into the original equation to find $y$.',
        ],
        example: {
          question: 'Find the stationary point of $y=x^2-6x+5$.',
          solution: [
            '$\\frac{dy}{dx}=2x-6$.',
            'Set $2x-6=0$, so $x=3$.',
            'Substitute into the original curve: $y=3^2-6(3)+5=-4$.',
            'The stationary point is $(3,-4)$.',
          ],
        },
        check: {
          question: 'Find the stationary point of $y=x^2-8x+1$.',
          answer: '(4,-15)',
          answerType: 'coordinate',
          acceptedAnswers: ['(4,-15)', '4,-15', '(4, -15)'],
          solution: ['$\\frac{dy}{dx}=2x-8$.', 'Set $2x-8=0$, so $x=4$.', '$y=4^2-8(4)+1=-15$.'],
        },
        blocks: [
          { type: 'text', content: 'Stationary points happen when $\\frac{dy}{dx}=0$.' },
          { type: 'math', latex: '\\frac{dy}{dx}=0' },
          { type: 'text', content: 'After finding the $x$ value, substitute it back into the original equation to find $y$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the stationary point of $y=x^2-6x+5$.',
            solution: [
              '$\\frac{dy}{dx}=2x-6$.',
              'Set $2x-6=0$, so $x=3$.',
              'Substitute into the original curve to get $y=-4$.',
              'The stationary point is $(3,-4)$.',
            ],
          },
        ],
      },
      {
        id: 'increasing-decreasing',
        title: 'Increasing and decreasing',
        summary: 'Use the sign of the derivative to show where a function rises or falls.',
        intro: [
          'A function is increasing where its gradient is positive.',
          'A function is decreasing where its gradient is negative.',
          'For Higher questions, you may be asked to show this or find values where it happens.',
        ],
        example: {
          question: 'For $f(x)=x^2-4x+1$, find where the function is increasing.',
          solution: [
            "$f'(x)=2x-4$.",
            "Increasing means $f'(x)>0$.",
            'So $2x-4>0$, giving $x>2$.',
          ],
        },
        check: {
          question: 'For $f(x)=x^2-10x+7$, find the values of $x$ where the function is increasing.',
          answer: 'x>5',
          answerType: 'text',
          acceptedAnswers: ['x>5', 'x > 5', '$x>5$'],
          solution: ["$f'(x)=2x-10$.", 'Increasing means $2x-10>0$.', 'Therefore $x>5$.'],
        },
        blocks: [
          { type: 'text', content: 'Differentiate first, then look at the sign of the derivative.' },
          { type: 'math', latex: 'f\\text{ increasing when }f\\prime(x)>0' },
          { type: 'math', latex: 'f\\text{ decreasing when }f\\prime(x)<0' },
          {
            type: 'example',
            title: 'Example',
            question: 'For $f(x)=x^2-4x+1$, find where the function is increasing.',
            solution: [
              "$f'(x)=2x-4$.",
              "Increasing means $f'(x)>0$.",
              'So $2x-4>0$, giving $x>2$.',
            ],
          },
        ],
      },
      {
        id: 'chain-rule-brackets',
        title: 'Chain rule for brackets',
        summary: 'Differentiate bracket powers without formal notation.',
        intro: [
          'Use this when a bracket is raised to a power, such as $(3x-1)^5$.',
          'Bring the power down, reduce the power by $1$, then multiply by the gradient inside the bracket.',
          'This lesson only uses linear brackets.',
        ],
        example: {
          question: 'Differentiate $y=(2x+3)^4$.',
          solution: [
            'Bring down the $4$: $4(2x+3)^3$.',
            'The gradient inside the bracket is $2$.',
            'Multiply by $2$ to get $8(2x+3)^3$.',
          ],
        },
        check: {
          question: 'Differentiate $y=(3x-5)^4$.',
          answer: '12(3x-5)^3',
          answerType: 'expression',
          acceptedAnswers: ['12(3x-5)^3', '12*(3x-5)^3', '$12(3x-5)^3$'],
          solution: ['Bring down the $4$ to get $4(3x-5)^3$.', 'The gradient inside the bracket is $3$.', 'Multiply to get $12(3x-5)^3$.'],
        },
        blocks: [
          { type: 'text', content: 'For $y=(ax+b)^n$, keep the bracket, reduce the power, and multiply by the gradient inside.' },
          { type: 'math', latex: '\\frac{d}{dx}(ax+b)^n=an(ax+b)^{n-1}' },
          { type: 'text', content: 'This version is for linear brackets only.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Differentiate $y=(2x+3)^4$.',
            solution: [
              'Bring down the $4$: $4(2x+3)^3$.',
              'The gradient inside the bracket is $2$.',
              'Multiply by $2$ to get $8(2x+3)^3$.',
            ],
          },
        ],
      },
      {
        id: 'differentiate-sin-cos',
        title: 'Differentiating sin x and cos x',
        summary: 'Know the standard derivatives of $\\sin x$ and $\\cos x$.',
        intro: [
          'At Higher, you need the standard derivatives of sine and cosine.',
          '$\\sin x$ differentiates to $\\cos x$.',
          '$\\cos x$ differentiates to $-\\sin x$.',
        ],
        example: {
          question: 'Differentiate $y=4\\sin x-3\\cos x$.',
          solution: [
            '$4\\sin x$ becomes $4\\cos x$.',
            '$-3\\cos x$ becomes $3\\sin x$ because $\\cos x$ differentiates to $-\\sin x$.',
            'So $\\frac{dy}{dx}=4\\cos x+3\\sin x$.',
          ],
        },
        check: {
          question: 'Differentiate $y=5\\sin x+2\\cos x$.',
          answer: '5cosx-2sinx',
          answerType: 'expression',
          acceptedAnswers: ['5cosx-2sinx', '5cos x-2sin x', '5\\cos x-2\\sin x', '$5\\cos x-2\\sin x$'],
          solution: ['$5\\sin x$ becomes $5\\cos x$.', '$2\\cos x$ becomes $-2\\sin x$.', 'So the derivative is $5\\cos x-2\\sin x$.'],
        },
        blocks: [
          { type: 'math', latex: '\\frac{d}{dx}(\\sin x)=\\cos x' },
          { type: 'math', latex: '\\frac{d}{dx}(\\cos x)=-\\sin x' },
          { type: 'text', content: 'Keep any multiplier in front of the trig function.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Differentiate $y=4\\sin x-3\\cos x$.',
            solution: [
              '$4\\sin x$ becomes $4\\cos x$.',
              '$-3\\cos x$ becomes $3\\sin x$.',
              'So $\\frac{dy}{dx}=4\\cos x+3\\sin x$.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'integration',
    title: 'Integration',
    icon: '∫',
    colour: '#10B981',
    description: 'Areas, antiderivatives, definite integrals',
    subtopics: [
      {
        id: 'integration-power-rule',
        title: 'Integration power rule',
        summary: 'Reverse differentiation by increasing the power and dividing by the new power.',
        intro: [
          'Integration is the reverse process of differentiation.',
          'For powers of $x$, increase the power by $1$, then divide by the new power.',
          'For indefinite integrals, always add the constant $C$.',
        ],
        example: {
          question: 'Integrate $6x^2-4x+5$ with respect to $x$.',
          solution: [
            '$6x^2$ integrates to $2x^3$.',
            '$-4x$ integrates to $-2x^2$.',
            '$5$ integrates to $5x$.',
            'So $\\int (6x^2-4x+5)\\,dx=2x^3-2x^2+5x+C$.',
          ],
        },
        check: {
          question: 'Integrate $8x^3-6x^2$ with respect to $x$, ignoring $C$.',
          answer: '2x^4-2x^3',
          answerType: 'expression',
          acceptedAnswers: ['2x^4-2x^3', '2x^4 - 2x^3'],
          solution: ['$8x^3$ integrates to $2x^4$.', '$-6x^2$ integrates to $-2x^3$.'],
        },
        blocks: [
          { type: 'text', content: 'For powers of $x$, use the reverse power rule.' },
          { type: 'math', latex: '\\int ax^n\\,dx=\\frac{ax^{n+1}}{n+1}+C' },
          { type: 'text', content: 'Remember the constant of integration, $C$, for indefinite integrals.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Integrate $6x^2-4x+5$ with respect to $x$.',
            solution: [
              '$6x^2$ integrates to $2x^3$.',
              '$-4x$ integrates to $-2x^2$.',
              '$5$ integrates to $5x$.',
              'So the answer is $2x^3-2x^2+5x+C$.',
            ],
          },
        ],
      },
      {
        id: 'area-under-graph',
        title: 'Area under a graph',
        summary: 'Use a definite integral to find the shaded area under a curve.',
        intro: [
          'A definite integral can calculate the area between a graph and the $x$-axis.',
          'First integrate to find an antiderivative.',
          'Then substitute the upper limit and subtract the lower limit.',
        ],
        example: {
          question: 'Find the area under $y=2x+1$ from $x=1$ to $x=3$.',
          solution: [
            '$\\int(2x+1)\\,dx=x^2+x$.',
            'Substitute the limits: $[x^2+x]_1^3$.',
            'At $x=3$, $x^2+x=12$. At $x=1$, $x^2+x=2$.',
            'Area $=12-2=10$ square units.',
          ],
        },
        check: {
          question: 'Find the area under $y=3x^2$ from $x=0$ to $x=2$.',
          answer: '8',
          answerType: 'number',
          acceptedAnswers: ['8'],
          solution: ['$\\int 3x^2\\,dx=x^3$.', 'Evaluate from $0$ to $2$: $2^3-0^3=8$.'],
        },
        blocks: [
          { type: 'area-graphic' },
          { type: 'math', latex: '\\int_a^b f(x)\\,dx=F(b)-F(a)' },
          { type: 'text', content: 'The result is an area when the graph is above the $x$-axis.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the area under $y=2x+1$ from $x=1$ to $x=3$.',
            solution: [
              '$\\int(2x+1)\\,dx=x^2+x$.',
              '$[x^2+x]_1^3=(9+3)-(1+1)$.',
              'Area $=10$ square units.',
            ],
          },
        ],
      },
      {
        id: 'integrating-trig',
        title: 'Integrating trig',
        summary: 'Use the reverse of differentiating $\\sin x$ and $\\cos x$.',
        intro: [
          'Trig integration uses the reverse of trig differentiation.',
          'Since $\\sin x$ differentiates to $\\cos x$, $\\cos x$ integrates to $\\sin x$.',
          'Since $\\cos x$ differentiates to $-\\sin x$, $\\sin x$ integrates to $-\\cos x$.',
        ],
        example: {
          question: 'Integrate $4\\cos x-3\\sin x$ with respect to $x$.',
          solution: [
            '$4\\cos x$ integrates to $4\\sin x$.',
            '$-3\\sin x$ integrates to $3\\cos x$.',
            'So the integral is $4\\sin x+3\\cos x+C$.',
          ],
        },
        check: {
          question: 'Integrate $5\\cos x+2\\sin x$ with respect to $x$, ignoring $C$.',
          answer: '5sinx-2cosx',
          answerType: 'expression',
          acceptedAnswers: ['5sinx-2cosx', '5sin x-2cos x', '5\\sin x-2\\cos x'],
          solution: ['$5\\cos x$ integrates to $5\\sin x$.', '$2\\sin x$ integrates to $-2\\cos x$.'],
        },
        blocks: [
          { type: 'math', latex: '\\int \\cos x\\,dx=\\sin x+C' },
          { type: 'math', latex: '\\int \\sin x\\,dx=-\\cos x+C' },
          { type: 'text', content: 'Keep any multiplier in front of the trig function.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Integrate $4\\cos x-3\\sin x$ with respect to $x$.',
            solution: [
              '$4\\cos x$ integrates to $4\\sin x$.',
              '$-3\\sin x$ integrates to $3\\cos x$.',
              'So the answer is $4\\sin x+3\\cos x+C$.',
            ],
          },
        ],
      },
      {
        id: 'differential-equations',
        title: 'Differential equations',
        summary: 'Integrate a gradient function, then use a point to find the constant.',
        intro: [
          'A differential equation can give you $\\frac{dy}{dx}$ instead of $y$.',
          'Integrate $\\frac{dy}{dx}$ to find $y$.',
          'If a point is given, substitute it to find the constant.',
        ],
        example: {
          question: 'Given $\\frac{dy}{dx}=6x+2$ and the curve passes through $(1,5)$, find $y$.',
          solution: [
            'Integrate: $y=3x^2+2x+C$.',
            'Use $(1,5)$: $5=3(1)^2+2(1)+C$.',
            'So $5=5+C$, meaning $C=0$.',
            'Therefore $y=3x^2+2x$.',
          ],
        },
        check: {
          question: 'Given $\\frac{dy}{dx}=4x+3$ and the curve passes through $(1,9)$, find $C$ after integrating.',
          answer: '4',
          answerType: 'number',
          acceptedAnswers: ['4'],
          solution: ['Integrate to get $y=2x^2+3x+C$.', 'Use $(1,9)$: $9=2+3+C$.', 'So $C=4$.'],
        },
        blocks: [
          { type: 'text', content: 'Start by integrating the expression for $\\frac{dy}{dx}$.' },
          { type: 'math', latex: 'y=\\int \\frac{dy}{dx}\\,dx' },
          { type: 'text', content: 'Then use the given point to calculate $C$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Given $\\frac{dy}{dx}=6x+2$ and the curve passes through $(1,5)$, find $y$.',
            solution: [
              '$y=3x^2+2x+C$.',
              '$5=3+2+C$, so $C=0$.',
              'Therefore $y=3x^2+2x$.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'logs-exponentials',
    title: 'Logs and Exponentials',
    icon: 'logₐ',
    colour: '#8B5CF6',
    description: 'Log laws, exponentials, equations',
    subtopics: [
      {
        id: 'laws-of-logs',
        title: 'Laws of logs',
        summary: 'Learn the three log laws used to simplify and solve Higher equations.',
        intro: [
          'Logarithms turn powers into simpler expressions.',
          'The laws of logs only work when the logs have the same base.',
          'Most Higher questions use these laws to combine, split, or move powers.',
        ],
        example: {
          question: 'Write $2\\log_a x+\\log_a y$ as a single logarithm.',
          solution: [
            'Use the power law first: $2\\log_a x=\\log_a(x^2)$.',
            'Then use the addition law: $\\log_a(x^2)+\\log_a y=\\log_a(x^2y)$.',
            'So the expression is $\\log_a(x^2y)$.',
          ],
        },
        check: {
          question: 'Write $\\log_a p-\\log_a q$ as a single logarithm.',
          answer: 'log_a(p/q)',
          answerType: 'expression',
          acceptedAnswers: ['log_a(p/q)', 'loga(p/q)', '\\log_a(p/q)', '$\\log_a\\left(\\frac{p}{q}\\right)$'],
          solution: [
            'Subtraction of logs means division of the arguments.',
            'So $\\log_a p-\\log_a q=\\log_a\\left(\\frac{p}{q}\\right)$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'Use these laws when the logarithms have the same base.' },
          { type: 'math', latex: '\\log_a x+\\log_a y=\\log_a(xy)' },
          { type: 'math', latex: '\\log_a x-\\log_a y=\\log_a\\left(\\frac{x}{y}\\right)' },
          { type: 'math', latex: 'n\\log_a x=\\log_a(x^n)' },
          {
            type: 'example',
            title: 'Example',
            question: 'Write $2\\log_a x+\\log_a y$ as a single logarithm.',
            solution: [
              '$2\\log_a x=\\log_a(x^2)$.',
              '$\\log_a(x^2)+\\log_a y=\\log_a(x^2y)$.',
            ],
          },
        ],
      },
      {
        id: 'numerical-log-expressions',
        title: 'Numerical log expressions',
        summary: 'Use log laws and known powers to simplify numerical expressions.',
        intro: [
          'Logs are the opposite of powers.',
          'If $a^b=c$, then $\\log_a c=b$.',
          'Use the log laws to combine the expression first, then evaluate it.',
        ],
        example: {
          question: 'Simplify $\\log_2 8+\\log_2 4$.',
          solution: [
            'Use the addition law: $\\log_2 8+\\log_2 4=\\log_2(8\\times4)$.',
            'So the expression becomes $\\log_2 32$.',
            'Since $2^5=32$, $\\log_2 32=5$.',
          ],
        },
        check: {
          question: 'Simplify $\\log_3 27-\\log_3 9$.',
          answer: '1',
          answerType: 'number',
          acceptedAnswers: ['1'],
          solution: [
            'Use the subtraction law: $\\log_3 27-\\log_3 9=\\log_3\\left(\\frac{27}{9}\\right)$.',
            'This gives $\\log_3 3$.',
            'Since $3^1=3$, the answer is $1$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'For numerical log questions, combine first, then use powers you know.' },
          { type: 'math', latex: '\\log_a x+\\log_a y=\\log_a(xy)' },
          { type: 'math', latex: '\\log_a x-\\log_a y=\\log_a\\left(\\frac{x}{y}\\right)' },
          { type: 'math', latex: '\\log_a(a^n)=n' },
          {
            type: 'example',
            title: 'Example',
            question: 'Simplify $\\log_2 8+\\log_2 4$.',
            solution: [
              '$\\log_2 8+\\log_2 4=\\log_2(32)$.',
              '$2^5=32$, so $\\log_2 32=5$.',
            ],
          },
        ],
      },
      {
        id: 'algebraic-log-expressions',
        title: 'Algebraic log expressions',
        summary: 'Simplify algebraic log expressions into a single logarithm.',
        intro: [
          'Algebraic log expressions use the same laws as numerical ones.',
          'Coefficients in front of logs can become powers.',
          'The aim is often to write the whole expression as one logarithm.',
        ],
        example: {
          question: 'Simplify $2\\log x+\\log y-\\log z$ into a single logarithm.',
          solution: [
            'Use the power law: $2\\log x=\\log(x^2)$.',
            'Addition means multiply: $\\log(x^2)+\\log y=\\log(x^2y)$.',
            'Subtraction means divide, so the answer is $\\log\\left(\\frac{x^2y}{z}\\right)$.',
          ],
        },
        check: {
          question: 'Simplify $3\\log a-\\log b$ into a single logarithm.',
          answer: 'log(a^3/b)',
          answerType: 'expression',
          acceptedAnswers: [
            'log(a^3/b)',
            'log(a^3÷b)',
            'log(a^3 over b)',
            '\\log(a^3/b)',
            '$\\log\\left(\\frac{a^3}{b}\\right)$',
          ],
          solution: [
            'Use the power law: $3\\log a=\\log(a^3)$.',
            'Then subtracting logs divides the arguments.',
            'So $3\\log a-\\log b=\\log\\left(\\frac{a^3}{b}\\right)$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'Move numbers in front of logs up as powers before combining.' },
          { type: 'math', latex: 'n\\log x=\\log(x^n)' },
          { type: 'math', latex: '\\log x+\\log y=\\log(xy)' },
          { type: 'math', latex: '\\log x-\\log y=\\log\\left(\\frac{x}{y}\\right)' },
          {
            type: 'example',
            title: 'Example',
            question: 'Simplify $2\\log x+\\log y-\\log z$ into a single logarithm.',
            solution: [
              '$2\\log x=\\log(x^2)$.',
              '$\\log(x^2)+\\log y=\\log(x^2y)$.',
              'So the final answer is $\\log\\left(\\frac{x^2y}{z}\\right)$.',
            ],
          },
        ],
      },
      {
        id: 'solving-log-equations',
        title: 'Solving log equations',
        summary: 'Use log laws to combine logs, then rewrite in index form.',
        intro: [
          'When an equation contains logarithms, try to get one log on one side.',
          'Use log laws to combine separate logs.',
          'Then rewrite the log equation as a power equation and solve.',
        ],
        example: {
          question: 'Solve $\\log_2 x+\\log_2 4=5$.',
          solution: [
            'Combine the logs: $\\log_2(4x)=5$.',
            'Rewrite in index form: $4x=2^5$.',
            'So $4x=32$, giving $x=8$.',
          ],
        },
        check: {
          question: 'Solve $\\log_3 x+\\log_3 9=4$.',
          answer: '9',
          answerType: 'number',
          acceptedAnswers: ['9', 'x=9', 'x = 9'],
          solution: [
            'Combine the logs: $\\log_3(9x)=4$.',
            'Rewrite as $9x=3^4$.',
            '$9x=81$, so $x=9$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'A useful target is one logarithm equal to one number.' },
          { type: 'math', latex: '\\log_a X=n\\quad\\text{means}\\quad X=a^n' },
          { type: 'text', content: 'After rewriting in index form, solve the equation normally.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Solve $\\log_2 x+\\log_2 4=5$.',
            solution: [
              '$\\log_2 x+\\log_2 4=\\log_2(4x)$.',
              '$\\log_2(4x)=5$ means $4x=2^5$.',
              'So $x=8$.',
            ],
          },
        ],
      },
      {
        id: 'unknown-exponent-equations',
        title: 'Unknown exponent equations',
        summary: 'Use logs to solve equations where the unknown is in the power.',
        intro: [
          'When the unknown is an exponent, you usually cannot solve by ordinary algebra.',
          'Take logs of both sides, then use the power law to bring the exponent down.',
          'You can use any log base, but calculator questions usually use $\\log$ or $\\ln$.',
        ],
        example: {
          question: 'Solve $3^x=20$, giving your answer to $2$ decimal places.',
          solution: [
            'Take logs of both sides: $\\log(3^x)=\\log 20$.',
            'Use the power law: $x\\log 3=\\log 20$.',
            'So $x=\\frac{\\log 20}{\\log 3}=2.73$ to $2$ decimal places.',
          ],
        },
        check: {
          question: 'Solve $2^x=11$, giving your answer to $2$ decimal places.',
          answer: '3.46',
          answerType: 'number',
          acceptedAnswers: ['3.46', 'x=3.46', 'x = 3.46'],
          solution: [
            'Take logs: $\\log(2^x)=\\log 11$.',
            'So $x\\log 2=\\log 11$.',
            '$x=\\frac{\\log 11}{\\log 2}=3.46$ to $2$ decimal places.',
          ],
        },
        blocks: [
          { type: 'text', content: 'Use logs when the unknown appears in the exponent.' },
          { type: 'math', latex: 'a^x=b' },
          { type: 'math', latex: 'x=\\frac{\\log b}{\\log a}' },
          { type: 'text', content: 'This comes from taking logs of both sides and using $\\log(a^x)=x\\log a$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Solve $3^x=20$, giving your answer to $2$ decimal places.',
            solution: [
              '$x\\log 3=\\log 20$.',
              '$x=\\frac{\\log 20}{\\log 3}=2.73$.',
            ],
          },
        ],
      },
      {
        id: 'deriving-exponential-equations',
        title: 'Deriving exponential equations',
        summary: 'Use straight-line graphs to find models like $y=ab^x$ or $y=ax^b$.',
        intro: [
          'Some exponential relationships can be turned into straight lines by taking logs.',
          'For $y=ab^x$, plotting $\\log y$ against $x$ gives a straight line.',
          'For $y=ax^b$, plotting $\\log y$ against $\\log x$ gives a straight line.',
        ],
        example: {
          question: 'For $y=ab^x$, a graph of $\\log y$ against $x$ has equation $Y=0.3x+0.7$, where $Y=\\log y$. Find $a$ and $b$.',
          solution: [
            'Take logs: $\\log y=\\log a+x\\log b$.',
            'Compare with $Y=0.3x+0.7$.',
            'So $\\log b=0.3$ and $\\log a=0.7$.',
            'Therefore $b=10^{0.3}$ and $a=10^{0.7}$.',
          ],
        },
        check: {
          question: 'For $y=ax^b$, a graph of $\\log y$ against $\\log x$ has equation $Y=2X+0.5$. What is $b$?',
          answer: '2',
          answerType: 'number',
          acceptedAnswers: ['2', 'b=2', 'b = 2'],
          solution: [
            'For $y=ax^b$, taking logs gives $\\log y=\\log a+b\\log x$.',
            'The gradient of the straight line is $b$.',
            'Since the gradient is $2$, $b=2$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'For $y=ab^x$, take logs to make a straight line in $x$.' },
          { type: 'math', latex: '\\log y=x\\log b+\\log a' },
          { type: 'text', content: 'Gradient $=\\log b$ and intercept $=\\log a$.' },
          { type: 'text', content: 'For $y=ax^b$, take logs to make a straight line in $\\log x$.' },
          { type: 'math', latex: '\\log y=b\\log x+\\log a' },
          { type: 'text', content: 'Gradient $=b$ and intercept $=\\log a$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'For $y=ab^x$, a graph of $\\log y$ against $x$ has equation $Y=0.3x+0.7$. Find $a$ and $b$.',
            solution: [
              '$\\log b=0.3$, so $b=10^{0.3}$.',
              '$\\log a=0.7$, so $a=10^{0.7}$.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'straight-line',
    title: 'Straight Line',
    icon: '↗',
    colour: '#14B8A6',
    description: 'Gradients, equations, intersections',
    subtopics: [
      {
        id: 'parallel-perpendicular-lines',
        title: 'Perpendicular lines',
        summary: 'Perpendicular gradients multiply to $-1$.',
        intro: [
          'This lesson is about finding the gradient of a perpendicular line, when we know the gradient of a line.',
          'Perpendicular lines meet at $90^\\circ$, so their gradients are negative reciprocals (they multiply to -1).',
        ],
        example: {
          question: 'A line has gradient $\\frac{2}{3}$. Find the gradient of the perpendicular line.',
          solution: [
            'Perpendicular gradient: change sign and flip the fraction.',
            'So the perpendicular gradient is $-\\frac{3}{2}$.',
          ],
        },
        check: {
          question: 'A line has gradient $-\\frac{4}{5}$. What is the gradient of a perpendicular line?',
          answer: '5/4',
          answerType: 'number',
          acceptedAnswers: ['5/4', '\\frac{5}{4}', '$\\frac{5}{4}$', '1.25'],
          solution: ['Flip $-\\frac{4}{5}$ to get $-\\frac{5}{4}$, then change the sign.', 'The perpendicular gradient is $\\frac{5}{4}$.'],
        },
        blocks: [
          { type: 'text', content: 'Find the gradient of L1 first. If L2 is perpendicular, we can find its gradient by changing the sign and flipping the fraction.' },          { type: 'math', latex: 'm_1 * m_2 = -1' },
          { type: 'text', content: 'We can also use the equation above to verify if two lines are perpendicular.' },
          {
            type: 'example',
            title: 'Example',
            question: 'A line has gradient $\\frac{2}{3}$. Find the gradient of a line parallel to it and a line perpendicular to it.',
            solution: [
              'Parallel gradient: $\\frac{2}{3}$.',
              'Perpendicular gradient: change sign and flip the fraction.',
              'So the perpendicular gradient is $-\\frac{3}{2}$.',
            ],
          },
        ],
      },
      {
        id: 'angles-straight-lines',
        title: 'Angles and straight lines',
        summary: 'The angle a line makes with the positive $x$-axis is linked to its gradient.',
        intro: [
          'The gradient tells you the steepness of a line.',
          'If a line makes an angle $a$ with the positive $x$-axis, then the gradient is $\\tan a$.',
          'Use inverse tan when you know the gradient and need the angle.',
        ],
        example: {
          question: 'A line has gradient $1$. Find the angle it makes with the positive $x$-axis.',
          solution: ['Use $m=\\tan a$.', 'So $1=\\tan a$.', 'Therefore $a=45^\\circ$.'],
        },
        check: {
          question: 'A line has gradient $\\sqrt{3}$. What angle does it make with the positive $x$-axis?',
          answer: '60',
          answerType: 'number',
          acceptedAnswers: ['60', '60 degrees', '60^circ'],
          solution: ['Use $m=\\tan a$.', 'Since $\\tan 60^\\circ=\\sqrt{3}$, the angle is $60^\\circ$.'],
        },
        blocks: [
          { type: 'text', content: 'A positive gradient slopes upwards from left to right. A negative gradient slopes downwards from left to right.' },
          { type: 'math', latex: 'm=\\tan a' },
          { type: 'text', content: 'Here $a$ is the angle from the positive $x$-axis to the line, measured anticlockwise.' },
          {
            type: 'example',
            title: 'Example',
            question: 'A line has gradient $1$. Find the angle it makes with the positive $x$-axis.',
            solution: [
              'Use $m=\\tan a$.',
              'So $1=\\tan a$.',
              'Therefore $a=45^\\circ$.',
            ],
          },
        ],
      },
      {
        id: 'altitude',
        title: 'Altitude',
        summary: 'An altitude starts from a point in a triangle. It meets the opposite side of the triangle at $90^\\circ$.',
        intro: [
          'An altitude starts from a point in a triangle.',
          'It meets the opposite side of the triangle at $90^\\circ$.',
          'That means you use perpendicular gradients.',
        ],
        example: {
          question: 'Triangle $ABC$ has $A(1,2)$, $B(3,6)$ and $C(7,4)$. Find the equation of the altitude from $A$.',
          solution: [
            'Gradient of $BC$ is $\\frac{4-6}{7-3}=\\frac{-2}{4}=-\\frac{1}{2}$.',
            'The altitude is perpendicular, so its gradient is $2$.',
            'It passes through $A(1,2)$, so use $y-b=m(x-a)$.',
            '$y-2=2(x-1)$, hence $y=2x$.',
          ],
        },
        check: {
          question: 'Triangle $ABC$ has $A(2,7)$, $B(8,3)$ and $C(4,-1)$. Find the equation of the altitude from $A$. Your answer should be of the form $y = mx + c$.',
          answer: 'y=-x+9',
          answerType: 'equation',
          acceptedAnswers: ['y=-1x+9', 'y=-x+9'],
          solution: ['First find the gradient of $BC$.', 
            '$m = \\frac{-1-3}{4-8} = 1 $',
            'So the perpendicular gradient is -1.',
            'Sub point A into $y-b = m(x-a)$ equation.',
            '$y - 7 = -1(x - 2)$',
            '$y = -x + 9$'
          ],
        },
        blocks: [
          { type: 'text', content: 'To find an altitude in a triangle, first find the gradient of the side that it meets at $90^\\circ$.' },
          { type: 'text', content: 'The altitude is perpendicular to that side, so find the perpendicular gradient.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Triangle $ABC$ has $A(1,2)$, $B(3,6)$ and $C(7,4)$. Find the equation of the altitude from $A$ to $BC$.',
            solution: [
              'Gradient of $BC$ is $\\frac{4-6}{7-3}=\\frac{-2}{4}=-\\frac{1}{2}$.',
              'The altitude is perpendicular, so its gradient is $2$.',
              'It passes through $A(1,2)$, so use $y-b=m(x-a)$.',
              '$y-2=2(x-1)$, hence $y=2x$.',
            ],
          },
        ],
      },
      {
        id: 'median',
        title: 'Median',
        summary: 'A median joins a vertex to the midpoint of the opposite side.',
        intro: [
          'A median is a line through the midpoint of another line.',
          'First find the midpoint.',
          'Then find the gradient of the median.',
          'Then use $y - b = m(x - a)$'
        ],
        example: {
          question: 'Triangle $ABC$ has $A(2,1)$, $B(4,7)$ and $C(10,3)$. Find the equation of the median from $A$.',
          solution: [
            'First find the midpoint of $BC$.',
            '$M=(\\frac{4+10}{2},\\frac{7+3}{2})=(7,5)$.',
            'Find the gradient of $AM$:',
            '$m=\\frac{5-1}{7-2}=\\frac{4}{5}$.',
            'Use point $A(2,1)$: $y-1=\\frac{4}{5}(x-2)$.',
            '$5y - 5 = 4(x - 2)$',
            '$5y = 4x - 3$'
          ],
        },
        check: {
  question: 'Triangle $ABC$ has $A(1,3)$, $B(7,5)$ and $C(3,-3)$. Find the equation of the median from $A$. Give your answer in the form $y = mx + c$.',
  answer: 'y=-\\frac{1}{2}x+\\frac{7}{2}',
  answerType: 'equation',
  acceptedAnswers: [
    'y=-\\frac{1}{2}x+\\frac{7}{2}',
    'y=\\frac{-x+7}{2}',
  ],
  solution: [
    '$M=(\\frac{7+3}{2},\\frac{5+(-3)}{2})=(5,1)$.',
    '$m=\\frac{1-3}{5-1}=-\\frac{1}{2}$.',
    '$y-3=-\\frac{1}{2}(x-1)$.',
    '$y=-\\frac{1}{2}x+\\frac{7}{2}$.',
  ],
},
        blocks: [
          { type: 'text', content: 'A median does not need to meet the opposite side at $90^\\circ$. Its key feature is the midpoint.' },
          { type: 'math', latex: 'Midpoint =(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2})' },
          {
            type: 'example',
            title: 'Example',
            question: 'Triangle $ABC$ has $A(2,1)$, $B(4,7)$ and $C(10,3)$. Find the equation of the median from $A$.',
            solution: [
              'First find the midpoint of $BC$.',
              '$M=(\\frac{4+10}{2},\\frac{7+3}{2})=(7,5)$.',
              'Find the gradient of $AM$: $m=\\frac{5-1}{7-2}=\\frac{4}{5}$.',
              'Use point $A(2,1)$: $y-1=\\frac{4}{5}(x-2)$.',
              '$5y - 5 = 4(x - 2)$',
              '$5y = 4x - 3$'
            ],
          },
        ],
      },
      {
        id: 'perpendicular-bisector',
        title: 'Perpendicular bisector',
        summary: 'A perpendicular bisector crosses a line segment at its midpoint and at $90^\\circ$.',
        intro: [
          'A perpendicular bisector is a line which meets another line at $90^\\circ$ and also runs through the midpoint of that line.',
          'This means we use our midpoint equation as well as our perpendicular gradient rule.',
        ],
        example: {
          question: 'Find the perpendicular bisector of the line segment joining $A(2,3)$ and $B(8,7)$.',
          solution: [
              'Midpoint: $M=(\\frac{2+8}{2},\\frac{3+7}{2})=(5,5)$.',
              'Gradient of $AB$ is $\\frac{7-3}{8-2}=\\frac{4}{6}=\\frac{2}{3}$.',
              'Perpendicular gradient is $-\\frac{3}{2}$.',
              'Equation: $y-5=-\\frac{3}{2}(x-5)$.',
              'Multiply by 2: $2y - 10 = -3(x - 5)$.',
              'Expand + Simplify: $2y =-3x + 25$'
          ],
        },
        check: {
  question: 'Find the equation of the perpendicular bisector of the line joining $A(2,2)$ and $B(6,4)$. Give your answer in the form $y = mx + c$.',
  answer: 'y=-2x+11',
  answerType: 'equation',
  acceptedAnswers: [
    'y=-2x+11',
  ],
  solution: [
    '$M=(\\frac{2+6}{2},\\frac{2+4}{2})=(4,3)$.',
    '$m=\\frac{4-2}{6-2}=\\frac{1}{2}$.',
    '$m_{\\perp}=-2$.',
    '$y-3=-2(x-4)$.',
    '$y-3=-2x+8$.',
    '$y=-2x+11$.',
  ],
},
        blocks: [
          { type: 'text', content: 'This combines midpoint and perpendicular gradient. Find the midpoint first, then find the perpendicular gradient.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the perpendicular bisector of the line joining $A(2,3)$ and $B(8,7)$.',
            solution: [
              'Midpoint: $M=(\\frac{2+8}{2},\\frac{3+7}{2})=(5,5)$.',
              'Gradient of $AB$ is $\\frac{7-3}{8-2}=\\frac{4}{6}=\\frac{2}{3}$.',
              'Perpendicular gradient is $-\\frac{3}{2}$.',
              'Equation: $y-5=-\\frac{3}{2}(x-5)$.',
              'Multiply by 2: $2y - 10 = -3(x - 5)$.',
              'Expand + Simplify: $2y =-3x + 25$'
            ],
          },
        ],
      }
    ],
  },
  {
    id: 'polynomials',
    title: 'Polynomials',
    icon: 'x³',
    colour: '#6366F1',
    description: 'Factors, roots, division',
    subtopics: [
      {
        id: 'factorising-cubics',
        title: 'Factorising cubics',
        summary: 'Use a known factor, then factorise the remaining quadratic.',
        intro: [
          'A cubic has a highest power of $x^3$.',
          'To factorise a cubic fully, first find one linear factor.',
          'Then divide by that factor to get a quadratic, and factorise the quadratic.',
        ],
        example: {
          question: 'Factorise $f(x)=x^3-4x^2+x+6$ fully, given that $(x-2)$ is a factor.',
          solution: [
            'Divide $x^3-4x^2+x+6$ by $(x-2)$.',
            'The quotient is $x^2-2x-3$.',
            'Factorise the quadratic: $x^2-2x-3=(x-3)(x+1)$.',
            'So $f(x)=(x-2)(x-3)(x+1)$.',
          ],
        },
        check: {
          question: 'Factorise $x^3-6x^2+11x-6$ fully.',
          answer: '(x-1)(x-2)(x-3)',
          answerType: 'expression',
          acceptedAnswers: [
            '(x-1)(x-2)(x-3)',
            '(x-1)*(x-2)*(x-3)',
            '(x-3)(x-2)(x-1)',
            '(x-2)(x-1)(x-3)',
            '(x-2)(x-3)(x-1)',
          ],
          solution: [
            '$x=1$ gives $1-6+11-6=0$, so $(x-1)$ is a factor.',
            'Dividing gives $x^2-5x+6$.',
            '$x^2-5x+6=(x-2)(x-3)$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'Start by finding or using a factor such as $(x-a)$.' },
          { type: 'math', latex: 'f(a)=0' },
          { type: 'text', content: 'Divide the cubic by the factor to leave a quadratic.' },
          { type: 'text', content: 'Then factorise the quadratic in the usual way.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Factorise $f(x)=x^3-4x^2+x+6$ fully, given that $(x-2)$ is a factor.',
            solution: [
              'Divide by $(x-2)$ to get $x^2-2x-3$.',
              '$x^2-2x-3=(x-3)(x+1)$.',
              'So $f(x)=(x-2)(x-3)(x+1)$.',
            ],
          },
        ],
      },
      {
        id: 'show-linear-factor',
        title: 'Show a linear expression is a factor',
        summary: 'Substitute the matching root and show the result is zero.',
        intro: [
          'The factor theorem links factors and roots.',
          'If $(x-a)$ is a factor, then $f(a)=0$.',
          'If $(x+a)$ is a factor, then use $x=-a$.',
        ],
        example: {
          question: 'Show that $(x-2)$ is a factor of $f(x)=x^3-5x^2+8x-4$.',
          solution: [
            'For $(x-2)$, substitute $x=2$.',
            '$f(2)=2^3-5(2)^2+8(2)-4$.',
            '$f(2)=8-20+16-4=0$.',
            'Since $f(2)=0$, $(x-2)$ is a factor.',
          ],
        },
        check: {
          question: 'Show that $(x+1)$ is a factor of $f(x)=x^3+2x^2-x-2$. What value is $f(-1)$?',
          answer: '0',
          answerType: 'number',
          acceptedAnswers: ['0'],
          solution: ['For $(x+1)$, use $x=-1$.', '$f(-1)=-1+2+1-2=0$.', 'So $(x+1)$ is a factor.'],
        },
        blocks: [
          { type: 'text', content: 'For $(x-a)$, substitute $a$ into $f(x)$.' },
          { type: 'math', latex: 'f(a)=0\\iff (x-a)\\text{ is a factor}' },
          { type: 'text', content: 'For $(x+a)$, substitute $-a$ into $f(x)$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Show that $(x-2)$ is a factor of $f(x)=x^3-5x^2+8x-4$.',
            solution: [
              '$f(2)=2^3-5(2)^2+8(2)-4$.',
              '$f(2)=8-20+16-4=0$.',
              'Since $f(2)=0$, $(x-2)$ is a factor.',
            ],
          },
        ],
      },
      {
        id: 'intersection-polynomial-line',
        title: 'Intersection of polynomial and straight line',
        summary: 'Set the curve equation equal to the line equation.',
        intro: [
          'Intersection points are points that lie on both graphs.',
          'To find them, set the polynomial equal to the straight line.',
          'Then solve the resulting equation and substitute back to find $y$.',
        ],
        example: {
          question: 'Find the intersection points of $y=x^2+2x$ and $y=3x+4$.',
          solution: [
            'Set the equations equal: $x^2+2x=3x+4$.',
            'Rearrange: $x^2-x-4=0$.',
            'Using the quadratic formula gives $x=\\frac{1+\\sqrt{17}}{2}$ or $x=\\frac{1-\\sqrt{17}}{2}$.',
            'Substitute each value into $y=3x+4$ to find the matching $y$ values.',
          ],
        },
        check: {
          question: 'Find the $x$ values where $y=x^2-2x$ intersects $y=x$.',
          answer: '0,3',
          answerType: 'text',
          acceptedAnswers: ['0,3', '3,0', 'x=0,x=3', 'x=3,x=0'],
          solution: ['Set $x^2-2x=x$.', 'Then $x^2-3x=0$.', 'Factorise: $x(x-3)=0$, so $x=0$ or $x=3$.'],
        },
        blocks: [
          { type: 'text', content: 'At an intersection, the two $y$ values are equal.' },
          { type: 'math', latex: 'f(x)=mx+c' },
          { type: 'text', content: 'Rearrange to one side, solve for $x$, then substitute to find $y$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the intersection points of $y=x^2+2x$ and $y=3x+4$.',
            solution: [
              '$x^2+2x=3x+4$.',
              '$x^2-x-4=0$.',
              'Solve this equation, then substitute the $x$ values into the line.',
            ],
          },
        ],
      },
      {
        id: 'identify-polynomial-from-roots',
        title: 'Identify polynomial from graph or roots',
        summary: 'Use the roots to build the factors of the polynomial.',
        intro: [
          'A graph tells you the roots where it crosses or touches the $x$-axis.',
          'If the roots are $a$, $b$ and $c$, then the factors are $(x-a)$, $(x-b)$ and $(x-c)$.',
          'A repeated root means the graph touches the axis and turns around there.',
        ],
        example: {
          question: 'A cubic graph crosses the $x$-axis at $-1$, $2$ and $4$. Write a possible equation.',
          solution: [
            'Root $-1$ gives factor $(x+1)$.',
            'Root $2$ gives factor $(x-2)$.',
            'Root $4$ gives factor $(x-4)$.',
            'A possible equation is $y=(x+1)(x-2)(x-4)$.',
          ],
        },
        check: {
          question: 'A cubic has roots $-2$, $1$ and $3$. Write a possible equation with leading coefficient $1$.',
          answer: 'y=(x+2)(x-1)(x-3)',
          answerType: 'equation',
          acceptedAnswers: [
            'y=(x+2)(x-1)(x-3)',
            'y=(x+2)*(x-1)*(x-3)',
            '(x+2)(x-1)(x-3)',
            'y=(x-1)(x+2)(x-3)',
            'y=(x-3)(x-1)(x+2)',
          ],
          solution: ['Root $-2$ gives $(x+2)$.', 'Root $1$ gives $(x-1)$.', 'Root $3$ gives $(x-3)$.'],
        },
        blocks: [
          { type: 'text', content: 'Each root produces a linear factor.' },
          { type: 'math', latex: 'x=a\\text{ is a root }\\Rightarrow (x-a)\\text{ is a factor}' },
          { type: 'text', content: 'If the graph is stretched vertically, a multiplier may appear in front.' },
          {
            type: 'example',
            title: 'Example',
            question: 'A cubic graph crosses the $x$-axis at $-1$, $2$ and $4$. Write a possible equation.',
            solution: [
              'The factors are $(x+1)$, $(x-2)$ and $(x-4)$.',
              'A possible equation is $y=(x+1)(x-2)(x-4)$.',
            ],
          },
        ],
      },
      {
        id: 'solving-polynomial-equations',
        title: 'Solving polynomial equations',
        summary: 'Factorise the polynomial, then set each factor equal to zero.',
        intro: [
          'Solving a polynomial equation means finding the roots.',
          'Move everything to one side so the equation equals $0$.',
          'Factorise fully, then use each factor to find a solution.',
        ],
        example: {
          question: 'Solve $x^3-4x^2-x+4=0$.',
          solution: [
            'Factor by grouping: $x^2(x-4)-1(x-4)=0$.',
            'So $(x^2-1)(x-4)=0$.',
            'Then $(x-1)(x+1)(x-4)=0$.',
            'The solutions are $x=-1$, $x=1$ and $x=4$.',
          ],
        },
        check: {
          question: 'Solve $x^3-3x^2-4x+12=0$.',
          answer: '-2,2,3',
          answerType: 'text',
          acceptedAnswers: ['-2,2,3', '2,-2,3', '3,2,-2', 'x=-2,x=2,x=3'],
          solution: [
            'Group terms: $x^2(x-3)-4(x-3)=0$.',
            'So $(x^2-4)(x-3)=0$.',
            'Then $(x-2)(x+2)(x-3)=0$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'Put the polynomial equation into the form $f(x)=0$.' },
          { type: 'math', latex: '(x-a)(x-b)(x-c)=0' },
          { type: 'text', content: 'Each bracket can make the product equal to zero, so each bracket gives a solution.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Solve $x^3-4x^2-x+4=0$.',
            solution: [
              '$x^2(x-4)-1(x-4)=0$.',
              '$(x^2-1)(x-4)=0$.',
              '$(x-1)(x+1)(x-4)=0$.',
              'So $x=-1$, $x=1$ or $x=4$.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'functions',
    title: 'Functions',
    icon: 'ƒ',
    colour: '#EF4444',
    description: 'Domain, range, composites and graph transformations',
    subtopics: [
      {
        id: 'domain-and-range',
        title: 'Domain and range',
        summary: 'Identify allowed inputs and possible outputs of a function.',
        intro: [
          'A function relates inputs to outputs, with each input giving exactly one output.',
          'The domain is the set of possible inputs.',
          'The range is the set of possible outputs.',
        ],
        example: {
          question: 'Find a suitable domain for $f(x)=\\frac{3}{x-5}$.',
          solution: [
            'The denominator cannot be zero.',
            'So $x-5≠0$, which means $x≠5$.',
            'A suitable domain is $x\\in\\mathbb{R},\\ x≠5$.',
          ],
        },
        check: {
          question: 'Find a suitable domain for $g(x)=\\frac{6}{x+4}$.',
          answer: 'x≠-4',
          answerType: 'text',
          acceptedAnswers: ['x≠-4', 'x!=-4', 'x not equal -4', 'x\\ne-4', 'x ∈ R, x≠-4'],
          solution: [
            'The denominator cannot equal zero.',
            'Set $x+4≠0$.',
            'So $x≠-4$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'The domain is the input set. If no domain is given, use the largest sensible set of real values.' },
          { type: 'text', content: 'For fractions, exclude values that make the denominator zero.' },
          { type: 'math', latex: '\\frac{1}{x-a}\\quad\\text{means}\\quad x≠a' },
          { type: 'text', content: 'For even roots, the expression under the root must be greater than or equal to zero.' },
          { type: 'math', latex: '\\sqrt{h(x)}\\quad\\text{means}\\quad h(x)≥0' },
          { type: 'text', content: 'The range is the output set. A graph often makes the range easier to see.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the range of $f(x)=x^2$ for $x\\in\\mathbb{R}$.',
            solution: [
              'A square cannot be negative.',
              'The smallest value is $0$, when $x=0$.',
              'So the range is $f(x)≥0$.',
            ],
          },
        ],
      },
      {
        id: 'completing-the-square-functions',
        title: 'Completing the square',
        summary: 'Rewrite quadratics to find the turning point and range.',
        intro: [
          'Completing the square rewrites a quadratic so its shape and turning point are clear.',
          'This is useful for sketching graphs and finding the range.',
          'The squared bracket is always greater than or equal to zero.',
        ],
        example: {
          question: 'Write $x^2+6x+5$ in completed square form.',
          solution: [
            'Half the coefficient of $x$: half of $6$ is $3$.',
            'Start with $(x+3)^2=x^2+6x+9$.',
            'To get $x^2+6x+5$, subtract $4$.',
            'So $x^2+6x+5=(x+3)^2-4$.',
          ],
        },
        check: {
          question: 'Complete the square for $x^2-8x+3$.',
          answer: '(x-4)^2-13',
          answerType: 'expression',
          acceptedAnswers: ['(x-4)^2-13', '(x - 4)^2 - 13', '$ (x-4)^2-13 $'],
          solution: [
            'Half of $-8$ is $-4$.',
            '$(x-4)^2=x^2-8x+16$.',
            'So $x^2-8x+3=(x-4)^2-13$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'For $x^2+bx+c$, halve $b$ to build the bracket.' },
          { type: 'math', latex: 'x^2+bx+c=(x+\\frac{b}{2})^2+\\text{constant}' },
          { type: 'text', content: 'Once in the form $(x-a)^2+b$, the turning point is $(a,b)$.' },
          { type: 'math', latex: 'y=(x-a)^2+b\\quad\\text{has turning point}\\quad(a,b)' },
          { type: 'text', content: 'For an upward-opening quadratic, the range is $y≥b$.' },
          {
            type: 'example',
            title: 'Example',
            question: 'Find the turning point of $y=x^2+6x+5$.',
            solution: [
              '$x^2+6x+5=(x+3)^2-4$.',
              'This is $(x-(-3))^2-4$.',
              'The turning point is $(-3,-4)$.',
            ],
          },
        ],
      },
      {
        id: 'composite-functions',
        title: 'Composite functions',
        summary: 'Use the output from one function as the input for another.',
        intro: [
          'Two functions can be composed to make a new function.',
          'The output from one function becomes the input for the other.',
          'The order matters: $f(g(x))$ is usually different from $g(f(x))$.',
        ],
        example: {
          question: 'Let $f(x)=2x$ and $g(x)=x-3$. Find $f(g(x))$ and $g(f(x))$.',
          solution: [
            '$f(g(x))=f(x-3)=2(x-3)$.',
            '$g(f(x))=g(2x)=2x-3$.',
            'The answers are different, so order matters.',
          ],
        },
        check: {
          question: 'Let $f(x)=x^2+1$ and $g(x)=3x$. Find $f(g(x))$.',
          answer: '9x^2+1',
          answerType: 'expression',
          acceptedAnswers: ['9x^2+1', '9x^2 + 1', '(3x)^2+1'],
          solution: [
            '$f(g(x))=f(3x)$.',
            'Replace $x$ in $f(x)=x^2+1$ with $3x$.',
            '$f(g(x))=(3x)^2+1=9x^2+1$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'Work from the inside out.' },
          { type: 'math', latex: 'f(g(x))\\quad\\text{means do }g\\text{ first, then }f' },
          { type: 'text', content: 'Substitute the whole inside expression into the outside function.' },
          { type: 'math', latex: 'g(f(x))\\quad\\text{means do }f\\text{ first, then }g' },
          {
            type: 'example',
            title: 'Example',
            question: 'Let $f(x)=2x$ and $g(x)=x-3$. Find $f(g(x))$ and $g(f(x))$.',
            solution: [
              '$f(g(x))=f(x-3)=2(x-3)$.',
              '$g(f(x))=g(2x)=2x-3$.',
            ],
          },
        ],
      },
      {
        id: 'related-function-graphs',
        title: 'Related function graphs',
        summary: 'Sketch related graphs using translations, reflections and scalings.',
        intro: [
          'Related function graphs are made from a known graph using transformations.',
          'The notes use three main transformations: translation, reflection and scaling.',
          'Track how key points move, such as roots, intercepts and turning points.',
        ],
        example: {
          question: 'The point $(p,q)$ lies on $y=f(x)$. Where does it move on $y=f(x)+3$ and $y=f(x-2)$?',
          solution: [
            '$y=f(x)+3$ translates the graph up by $3$, so $(p,q)$ becomes $(p,q+3)$.',
            '$y=f(x-2)$ translates the graph right by $2$, so $(p,q)$ becomes $(p+2,q)$.',
          ],
        },
        check: {
          question: 'The point $(4,-2)$ lies on $y=f(x)$. Where does it move on $y=-f(x)$?',
          answer: '(4,2)',
          answerType: 'coordinate',
          acceptedAnswers: ['(4,2)', '4,2', '(4, 2)'],
          solution: [
            '$y=-f(x)$ reflects the graph in the $x$-axis.',
            'The $x$ coordinate stays the same and the $y$ coordinate changes sign.',
            'So $(4,-2)$ becomes $(4,2)$.',
          ],
        },
        blocks: [
          { type: 'text', content: 'A translation moves every point by the same amount. The shape does not change.' },
          { type: 'math', latex: 'f(x)+a\\quad\\text{moves up if }a>0\\text{ and down if }a<0' },
          { type: 'math', latex: 'f(x+a)\\quad\\text{moves left if }a>0\\text{ and right if }a<0' },
          { type: 'text', content: 'A reflection flips the graph about an axis. Apply reflection before translation.' },
          { type: 'math', latex: '-f(x)\\quad\\text{reflects in the }x\\text{-axis}' },
          { type: 'math', latex: 'f(-x)\\quad\\text{reflects in the }y\\text{-axis}' },
          { type: 'text', content: 'A scaling stretches or compresses the graph.' },
          { type: 'math', latex: 'kf(x)\\quad\\text{multiplies each }y\\text{-coordinate by }k' },
          { type: 'math', latex: 'f(kx)\\quad\\text{changes each }x\\text{-coordinate by factor }\\frac{1}{k}' },
          {
            type: 'example',
            title: 'Example',
            question: 'Describe the transformation from $y=f(x)$ to $y=2f(x)+1$.',
            solution: [
              '$2f(x)$ is a vertical scaling by factor $2$.',
              '$+1$ then translates the graph up by $1$.',
              'A point $(p,q)$ moves to $(p,2q+1)$.',
            ],
          },
        ],
      },
    ],
  },
];

export const topics = topicLessons.map(({ subtopics, ...topic }) => topic);

export function getTopic(topicId: TopicId) {
  return topicLessons.find((topic) => topic.id === topicId);
}

export function getSubtopic(topicId: TopicId, subtopicId: string) {
  return getTopic(topicId)?.subtopics.find((subtopic) => subtopic.id === subtopicId);
}
