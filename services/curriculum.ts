import { Lesson, ExerciseType, UnitConfig, AppLanguage } from '../types';

// --- ENGLISH CONTENT (BASE) ---

const UNITS_EN: UnitConfig[] = [
    { id: 'unit-1', title: 'Basics', description: 'Variables, Print, Math', color: 'green', lessons: ['basics-1', 'basics-2', 'basics-3'] },
    { id: 'unit-2', title: 'Structures', description: 'Lists, Dictionaries, Sets', color: 'blue', lessons: ['structures-1', 'structures-2', 'structures-3'] },
    { id: 'unit-3', title: 'Control Flow', description: 'If/Else, Loops, Logic', color: 'purple', lessons: ['flow-1', 'flow-2', 'flow-3'] },
    { id: 'unit-4', title: 'Functions', description: 'Def, Return, Scope', color: 'yellow', lessons: ['func-1', 'func-2'] },
    { id: 'unit-5', title: 'Object Oriented', description: 'Classes, Objects, Inheritance', color: 'indigo', lessons: ['oop-1', 'oop-2'] },
    { id: 'unit-6', title: 'Expert', description: 'Comprehensions, Error Handling', color: 'red', lessons: ['adv-1', 'adv-2'] },
    { id: 'unit-7', title: 'Modules', description: 'Imports, Random, Time', color: 'teal', lessons: ['imports-1', 'imports-2', 'imports-3'] },
    { id: 'unit-8', title: 'Functional', description: 'Lambda, Map, Filter', color: 'orange', lessons: ['func-adv-1', 'func-adv-2'] },
    { id: 'unit-9', title: 'Advanced', description: 'Decorators, Generators', color: 'pink', lessons: ['py-pro-1', 'py-pro-2'] },
    { id: 'unit-10', title: 'Data Science', description: 'Intro to Analysis', color: 'cyan', lessons: ['data-1', 'data-2'] },
    { id: 'unit-11', title: 'Built-in Math', description: 'abs, round, min, max', color: 'emerald', lessons: ['math-built-1', 'math-built-2', 'math-built-3'] },
    { id: 'unit-12', title: 'Logic & Inspect', description: 'all, any, type, id', color: 'violet', lessons: ['logic-built-1', 'logic-built-2', 'logic-built-3'] },
    { id: 'unit-13', title: 'Formatting', description: 'bin, hex, chr, ord', color: 'amber', lessons: ['fmt-built-1', 'fmt-built-2', 'fmt-built-3'] },
    { id: 'unit-14', title: 'Iteration Pro', description: 'enumerate, zip, sorted', color: 'lime', lessons: ['iter-built-1', 'iter-built-2', 'iter-built-3'] },
    { id: 'unit-15', title: 'Meta Magic', description: 'getattr, setattr, property', color: 'fuchsia', lessons: ['meta-built-1', 'meta-built-2', 'meta-built-3'] },
    { id: 'unit-16', title: 'System & Dyn', description: 'eval, exec, open', color: 'slate', lessons: ['sys-built-1', 'sys-built-2', 'sys-built-3'] },
    { id: 'unit-17', title: 'Bytes & Async', description: 'bytes, memoryview, aiter', color: 'zinc', lessons: ['byte-built-1', 'byte-built-2'] },
    
    // THE FINAL BOSS
    { id: 'unit-18', title: 'The Gauntlet', description: 'Final Python Trial', color: 'black', lessons: ['final-boss'] }
];

const LESSONS_EN: Record<string, Lesson> = {
  // UNIT 1: BASICS
  'basics-1': {
    id: 'basics-1', title: 'Print & Strings', description: 'print(), str()', totalXp: 100,
    learningContent: [
      "📣 **The Megaphone: print()**",
      "Imagine `print()` is a megaphone. Whatever you put inside the parentheses `( )`, the computer shouts onto the screen.",
      "",
      "**The Rule of Quotes**",
      "Computer brains are literal. They need to know what is code and what is just text.",
      "• `print(hello)` -> Computer looks for a variable named hello. (Error!)",
      "• `print(\"hello\")` -> Computer prints the text \"hello\".",
      "",
      "🧠 **Remember:** Quotes `\" \"` act like a container. They hold the text together safely."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'If you want the computer to say "Hello", what must you put around the word?', solution: 'print("Hello")', options: ["print 'Hello'", 'print("Hello")', 'display("Hello")', 'log.text("Hello")'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Complete the code to print "Snake":', solution: ['print("Snake")'], hint: "Don't forget the quotes around the text!" },
      { id: '3', type: ExerciseType.WRITE_CODE, prompt: 'Write a program that prints exactly: Python is fun', solution: ['print("Python is fun")'], hint: "Use print() with quotes inside the parentheses." }
    ]
  },
  'basics-2': {
      id: 'basics-2', title: 'Variables', description: 'Storage boxes for your data.', totalXp: 100,
      learningContent: [
        "📦 **Variables are Labeled Boxes**",
        "Imagine you have a moving box. You write a label on the outside, and put something inside.",
        "",
        "**The Syntax:** `label = content`",
        "• `score = 10` -> Label is 'score', content is 10.",
        "• `name = \"Pyssss\"` -> Label is 'name', content is \"Pyssss\".",
        "",
        "**Why utilize them?**",
        "If you want to change your score later, you don't need to find every place you wrote '10'. You just update the variable `score = 20` once!"
      ],
      exercises: [
        { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Which variable name is valid in Python?', solution: "snake_case", options: ["snake case", "2snake", "snake_case", "Snake-Case"] },
        { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Store the number 10 in a variable named "score":', solution: ["score = 10"], hint: "Just write the name of the variable on the left side." },
        { id: '3', type: ExerciseType.WRITE_CODE, prompt: 'Create a variable called `food` and set it to "Pizza"', solution: ['food = "Pizza"'], hint: 'Variable name on the left, value on the right.' }
      ]
  },
  'basics-3': {
      id: 'basics-3', title: 'Input & Math', description: 'Interact and Calculate.', totalXp: 150,
      learningContent: [
        "👂 **Listening: input()**",
        "If `print()` is the mouth, `input()` is the ear. It pauses the program and waits for the user to type something.",
        "",
        "**The Trap:** `input()` *always* hears text (Strings).",
        "If you type `5`, Python hears `\"5\"` (text).",
        "You cannot do Math with text! `\"5\" + \"5\"` equals `\"55\"`, not `10`.",
        "",
        "🔧 **The Fix:**",
        "Wrap it in `int()` to turn text into a number.",
        "`age = int(input(\"Your age: \"))`"
      ],
      exercises: [
        { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What function gets text from the user?', solution: "input()", options: ["get()", "input()", "ask()", "scan()"] },
        { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Calculate 5 times 5 and print the result.', solution: ["print(5*5)", "print(5 * 5)"], hint: "Use * for multiplication inside print()." }
      ]
  },

  // UNIT 2: STRUCTURES
  'structures-1': {
    id: 'structures-1', title: 'Lists', description: 'Organizing data in order.', totalXp: 150,
    learningContent: [
      "📜 **The Shopping List**",
      "A `list` is an ordered collection of items. It allows you to store multiple values in a single variable.",
      "",
      "**Syntax:** `[` and `]`",
      "• `fruits = [\"apple\", \"banana\", \"cherry\"]`",
      "",
      "**Accessing Items:**",
      "We use an index (position) to get items. Computers start counting at 0!",
      "• `fruits[0]` gives \"apple\"",
      "• `fruits[1]` gives \"banana\""
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'How do you create a list?', solution: 'x = [1, 2]', options: ['x = (1, 2)', 'x = {1, 2}', 'x = [1, 2]', 'x = 1, 2'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create a list named `colors` with "red" and "blue".', solution: ['colors = ["red", "blue"]'], hint: 'Use square brackets [] and quotes.' },
      { id: '3', type: ExerciseType.WRITE_CODE, prompt: 'Print the first item of `my_list`.', solution: ['print(my_list[0])'], hint: 'Index 0 is the first one.' }
    ]
  },
  'structures-2': {
    id: 'structures-2', title: 'Dictionaries', description: 'Keys and Values.', totalXp: 150,
    learningContent: [
      "📖 **The Real Dictionary**",
      "A `dictionary` stores data in key-value pairs, just like a real dictionary links a word (key) to a definition (value).",
      "",
      "**Syntax:** `{` and `}`",
      "• `user = {\"name\": \"Pyssss\", \"age\": 5}`",
      "",
      "**Accessing Values:**",
      "Use the key name inside square brackets.",
      "• `print(user[\"name\"])` prints \"Pyssss\""
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What symbol defines a dictionary?', solution: '{}', options: ['[]', '()', '{}', '<>'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create a dict `score` with key "points" and value 10.', solution: ['score = {"points": 10}'], hint: 'Use curly braces {} and a colon :.' },
      { id: '3', type: ExerciseType.WRITE_CODE, prompt: 'Access the "age" from variable `data`.', solution: ['data["age"]'], hint: 'Use square brackets with the key name string.' }
    ]
  },
  'structures-3': {
    id: 'structures-3', title: 'Sets & Tuples', description: 'Unique and Immutable types.', totalXp: 150,
    learningContent: [
      "🔒 **Tuples (Immutable)**",
      "A tuple is like a list, but it cannot be changed (immutable). Use parentheses `()`.",
      "• `coords = (10, 20)`",
      "",
      "✨ **Sets (Unique)**",
      "A set is unordered and has no duplicate items. Use curly braces `{}` but without keys.",
      "• `unique_nums = {1, 2, 3, 3}` -> becomes `{1, 2, 3}` automatically."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Which one cannot be changed?', solution: 'Tuple', options: ['List', 'Dictionary', 'Tuple', 'Set'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create a tuple named `fixed` with 1 and 2.', solution: ['fixed = (1, 2)'], hint: 'Use parentheses ().' }
    ]
  },

  // UNIT 3: CONTROL FLOW
  'flow-1': {
    id: 'flow-1', title: 'If / Else', description: 'Making decisions.', totalXp: 150,
    learningContent: [
      "🔀 **Fork in the Road**",
      "Code runs line-by-line, but `if` lets it choose a path.",
      "",
      "**Syntax:**",
      "```python",
      "if hungry:",
      "    print(\"Eat\")",
      "else:",
      "    print(\"Sleep\")",
      "```",
      "⚠️ **Indentation is Life:** Python needs that 4-space gap to know what's inside the block."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What starts the fallback block?', solution: 'else:', options: ['otherwise:', 'fallback:', 'else:', 'elif:'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'If `x` is greater than 5, print "Big".', solution: ['if x > 5:\n    print("Big")'], hint: 'Don\'t forget the colon : and indentation.' }
    ]
  },
  'flow-2': {
    id: 'flow-2', title: 'For Loops', description: 'Repeating things automatically.', totalXp: 150,
    learningContent: [
      "🔁 **The Loop-de-loop**",
      "Instead of writing code 10 times, use a loop.",
      "",
      "**For Loop:** Iterates over a list or range.",
      "```python",
      "for i in range(3):",
      "    print(i)",
      "```",
      "Prints: 0, 1, 2"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What function generates a sequence of numbers?', solution: 'range()', options: ['seq()', 'list()', 'range()', 'count()'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Loop through `items` and print each `x`.', solution: ['for x in items:\n    print(x)'], hint: 'for item in list:' }
    ]
  },
  'flow-3': {
    id: 'flow-3', title: 'While Loops', description: 'Looping until a condition is met.', totalXp: 150,
    learningContent: [
      "⏳ **While Loop**",
      "Runs *while* a condition is True.",
      "```python",
      "energy = 5",
      "while energy > 0:",
      "    print(\"Running...\")",
      "    energy = energy - 1",
      "```",
      "⚠️ Beware of infinite loops! Ensure the condition eventually becomes False."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'When does a while loop stop?', solution: 'When condition is False', options: ['When condition is True', 'When condition is False', 'Never', 'After 10 times'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Loop while `n` is greater than 0.', solution: ['while n > 0:'], hint: 'Use > operator.' }
    ]
  },

  // UNIT 4: FUNCTIONS
  'func-1': {
    id: 'func-1', title: 'Defining Functions', description: 'Reusable code recipes.', totalXp: 150,
    learningContent: [
      "🍳 **The Recipe: def**",
      "A function is a block of code you can name and reuse.",
      "",
      "**Syntax:**",
      "```python",
      "def greet():",
      "    print(\"Hello!\")",
      "```",
      "To use it, you must **call** it: `greet()`"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Keyword to define a function?', solution: 'def', options: ['func', 'def', 'function', 'define'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Define a function named `bark` that prints "Woof".', solution: ['def bark():\n    print("Woof")'], hint: 'def name():' }
    ]
  },
  'func-2': {
    id: 'func-2', title: 'Params & Return', description: 'Passing data in and out.', totalXp: 150,
    learningContent: [
      "📬 **Parameters (Inputs)**",
      "Pass data into functions via parentheses.",
      "```python",
      "def square(x):",
      "    return x * x",
      "```",
      "",
      "📤 **Return (Output)**",
      "Send data back to the main program using `return`. Without it, the result is lost inside the function."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What keyword sends data back?', solution: 'return', options: ['send', 'back', 'return', 'output'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Define `add(a, b)` that returns sum.', solution: ['def add(a, b):\n    return a + b'], hint: 'return a + b' }
    ]
  },

  // UNIT 5: OBJECT ORIENTED
  'oop-1': {
    id: 'oop-1', title: 'Classes & Objects', description: 'Blueprints for data.', totalXp: 200,
    learningContent: [
      "🏗️ **The Blueprint (Class)**",
      "A Class is a blueprint. An Object is the house built from it.",
      "",
      "```python",
      "class Dog:",
      "    def __init__(self, name):",
      "        self.name = name",
      "```",
      "**__init__**: The constructor. It runs when you create a new object.",
      "**self**: Refers to the specific object being created."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What is the constructor method?', solution: '__init__', options: ['__start__', '__init__', '__main__', '__create__'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create an instance `d` of `Dog` with name "Buddy".', solution: ['d = Dog("Buddy")'], hint: 'ClassName(arguments)' }
    ]
  },
  'oop-2': {
    id: 'oop-2', title: 'Methods & Inheritance', description: 'Adding behavior.', totalXp: 200,
    learningContent: [
      "🏃 **Methods**",
      "Functions inside a class are called Methods. They usually take `self` as the first argument.",
      "",
      "👨‍👦 **Inheritance**",
      "A class can inherit traits from another.",
      "```python",
      "class Puppy(Dog):",
      "    pass",
      "```",
      "`Puppy` gets everything `Dog` has!"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'First parameter of a method?', solution: 'self', options: ['this', 'self', 'me', 'obj'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Define a method `speak(self)` inside a class.', solution: ['def speak(self):'], hint: 'Indented inside class.' }
    ]
  },

  // UNIT 6: EXPERT
  'adv-1': {
    id: 'adv-1', title: 'List Comprehensions', description: 'Pythonic one-liners.', totalXp: 250,
    learningContent: [
      "⚡ **The Pythonic Way**",
      "Create lists in a single line.",
      "",
      "**Old Way:**",
      "```python",
      "nums = []",
      "for x in range(5):",
      "    nums.append(x * 2)",
      "```",
      "",
      "**Comprehension:**",
      "`nums = [x * 2 for x in range(5)]`",
      "Compact and fast!"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'What surrounds a list comprehension?', solution: '[]', options: ['()', '{}', '[]', '<>'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create list `sq` of squares for x in range 5.', solution: ['sq = [x*x for x in range(5)]'], hint: '[expr for var in iterable]' }
    ]
  },
  'adv-2': {
    id: 'adv-2', title: 'Error Handling', description: 'Try, Except, Finally.', totalXp: 250,
    learningContent: [
      "🛡️ **Catching Bugs**",
      "Don't let your program crash. Handle errors gracefully.",
      "```python",
      "try:",
      "    print(1 / 0)",
      "except ZeroDivisionError:",
      "    print(\"Cannot divide by zero!\")",
      "```",
      "The code inside `except` runs only if an error occurs in `try`."
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Block to catch errors?', solution: 'except', options: ['catch', 'except', 'error', 'handle'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Wrap code in a try block.', solution: ['try:\n    code()'], hint: 'try:' }
    ]
  },

  // UNIT 7: MODULES
  'imports-1': {
    id: 'imports-1', title: 'Imports', description: 'Using other code.', totalXp: 150,
    learningContent: [
      "📦 **Batteries Included**",
      "Python comes with many libraries. You access them with `import`.",
      "",
      "• `import math` -> usage: `math.sqrt(16)`",
      "• `from math import pi` -> usage: `print(pi)`"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Keyword to load a module?', solution: 'import', options: ['load', 'require', 'import', 'include'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Import the `os` module.', solution: ['import os'], hint: 'import name' }
    ]
  },
  'imports-2': {
    id: 'imports-2', title: 'Math & Random', description: 'Standard libraries.', totalXp: 150,
    learningContent: [
      "🎲 **Randomness**",
      "```python",
      "import random",
      "print(random.randint(1, 10))",
      "```",
      "",
      "🧮 **Math**",
      "```python",
      "import math",
      "print(math.sqrt(25)) # 5.0",
      "```"
    ],
    exercises: [
      { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get a random integer between 1 and 6.', solution: ['random.randint(1, 6)'], hint: 'import random first (assumed)' }
    ]
  },
  'imports-3': {
    id: 'imports-3', title: 'DateTime', description: 'Handling time.', totalXp: 150,
    learningContent: [
      "🕒 **Time Flies**",
      "The `datetime` module helps with dates.",
      "```python",
      "from datetime import datetime",
      "now = datetime.now()",
      "print(now.year)",
      "```"
    ],
    exercises: [
      { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Import datetime from datetime module.', solution: ['from datetime import datetime'], hint: 'from module import item' }
    ]
  },

  // UNIT 8: FUNCTIONAL PROGRAMMING
  'func-adv-1': {
    id: 'func-adv-1', title: 'Lambda Functions', description: 'Tiny anonymous functions.', totalXp: 300,
    learningContent: [
      "🎭 **Anonymous Functions**",
      "Sometimes you need a quick function for a short task. You don't want to name it.",
      "",
      "**Syntax:** `lambda arguments: expression`",
      "```python",
      "double = lambda x: x * 2",
      "print(double(5)) # 10",
      "```",
      "It returns the result automatically!"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Keyword for anonymous functions?', solution: 'lambda', options: ['def', 'anon', 'lambda', 'func'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create a lambda `add` that adds `x` and `y`.', solution: ['add = lambda x, y: x + y'], hint: 'lambda x, y: ...' }
    ]
  },
  'func-adv-2': {
    id: 'func-adv-2', title: 'Map & Filter', description: 'Processing lists efficiently.', totalXp: 300,
    learningContent: [
      "🗺️ **Map**",
      "Apply a function to every item in a list.",
      "`map(func, list)`",
      "",
      "🔍 **Filter**",
      "Keep only items where function returns True.",
      "`filter(func, list)`",
      "",
      "```python",
      "nums = [1, 2, 3]",
      "squared = list(map(lambda x: x*x, nums))",
      "```"
    ],
    exercises: [
      { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Filter `nums` to keep items > 5.', solution: ['filter(lambda x: x > 5, nums)'], hint: 'filter(condition_func, list)' }
    ]
  },

  // UNIT 9: ADVANCED PYTHON
  'py-pro-1': {
    id: 'py-pro-1', title: 'Decorators', description: 'Modifying functions dynamically.', totalXp: 350,
    learningContent: [
      "🎁 **Decorators**",
      "Decorators wrap a function to extend its behavior without changing its code.",
      "They use the `@` symbol.",
      "",
      "```python",
      "def my_decorator(func):",
      "    def wrapper():",
      "        print('Before!')",
      "        func()",
      "    return wrapper",
      "",
      "@my_decorator",
      "def say_hello():",
      "    print('Hello')",
      "```"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Symbol used for decorators?', solution: '@', options: ['#', '@', '%', '&'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Decorate `func` with `@timer`.', solution: ['@timer\ndef func():'], hint: 'Put @timer above the def.' }
    ]
  },
  'py-pro-2': {
    id: 'py-pro-2', title: 'Generators', description: 'Lazy evaluation.', totalXp: 350,
    learningContent: [
      "🏭 **Generators**",
      "Generators allow you to iterate over data without storing it all in memory at once.",
      "Use `yield` instead of `return`.",
      "",
      "```python",
      "def count_up(n):",
      "    x = 0",
      "    while x < n:",
      "        yield x",
      "        x += 1",
      "```"
    ],
    exercises: [
      { id: '1', type: ExerciseType.MULTIPLE_CHOICE, prompt: 'Keyword to pause function and produce value?', solution: 'yield', options: ['return', 'yield', 'produce', 'emit'] },
      { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Create generator yielding 1.', solution: ['yield 1'], hint: 'Just use yield keyword.' }
    ]
  },

  // UNIT 10: DATA SCIENCE INTRO
  'data-1': {
    id: 'data-1', title: 'Slicing', description: 'Cutting lists like a ninja.', totalXp: 400,
    learningContent: [
      "🔪 **Slicing**",
      "Extract parts of a list easily.",
      "Syntax: `list[start:end:step]`",
      "",
      "```python",
      "nums = [0, 1, 2, 3, 4]",
      "print(nums[1:4]) # [1, 2, 3]",
      "print(nums[::-1]) # Reverse list",
      "```"
    ],
    exercises: [
      { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get first 3 items of `data`.', solution: ['data[:3]'], hint: 'Use colon : inside brackets.' }
    ]
  },
  'data-2': {
    id: 'data-2', title: 'Unpacking', description: 'Assigning multiple variables.', totalXp: 400,
    learningContent: [
      "📦 **Unpacking**",
      "Assign values from a list to variables in one line.",
      "",
      "```python",
      "coords = (10, 20)",
      "x, y = coords",
      "print(x) # 10",
      "```",
      "Use `*` to grab the rest: `first, *rest = [1, 2, 3]`"
    ],
    exercises: [
      { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Unpack `a, b` from list `L`.', solution: ['a, b = L'], hint: 'var1, var2 = list' }
    ]
  },

  // UNIT 11: BUILT-IN MATH
  'math-built-1': {
      id: 'math-built-1', title: 'Basic Math', description: 'abs(), round(), pow()', totalXp: 200,
      learningContent: [
          "📐 **abs(x)**: Returns absolute value. `abs(-5)` -> 5",
          "🔵 **round(x, n)**: Rounds x to n digits. `round(3.14159, 2)` -> 3.14",
          "🚀 **pow(x, y)**: x to power of y. `pow(2, 3)` -> 8 (Same as `2**3`)"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get absolute value of -10', solution: ['abs(-10)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Round 5.678 to 1 digit', solution: ['round(5.678, 1)'] }
      ]
  },
  'math-built-2': {
      id: 'math-built-2', title: 'Stats Math', description: 'min(), max(), sum()', totalXp: 200,
      learningContent: [
          "⬇️ **min(iter)**: Smallest item. `min([1, 2, 3])` -> 1",
          "⬆️ **max(iter)**: Largest item. `max([1, 2, 3])` -> 3",
          "➕ **sum(iter)**: Adds all items. `sum([1, 2, 3])` -> 6"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Find max of list L', solution: ['max(L)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Sum tuple T', solution: ['sum(T)'] }
      ]
  },
  'math-built-3': {
      id: 'math-built-3', title: 'Complex Math', description: 'divmod(), complex()', totalXp: 200,
      learningContent: [
          "➗ **divmod(a, b)**: Returns (quotient, remainder). `divmod(5, 2)` -> `(2, 1)`",
          "🧠 **complex(real, imag)**: Creates a complex number. `complex(2, 3)` -> `2+3j`"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get divmod of 10 and 3', solution: ['divmod(10, 3)'] }
      ]
  },

  // UNIT 12: LOGIC & INSPECT
  'logic-built-1': {
      id: 'logic-built-1', title: 'Booleans', description: 'bool(), all(), any()', totalXp: 200,
      learningContent: [
          "⛳ **bool(x)**: Converts to True/False. `bool(0)` -> False",
          "✅ **all(iter)**: True if ALL items are True.",
          "⭕ **any(iter)**: True if ANY item is True."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Check if all in L are true', solution: ['all(L)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Check if any in L are true', solution: ['any(L)'] }
      ]
  },
  'logic-built-2': {
      id: 'logic-built-2', title: 'Identity', description: 'type(), id(), hash(), isinstance()', totalXp: 200,
      learningContent: [
          "🏷️ **type(obj)**: Returns the type of object.",
          "🆔 **id(obj)**: Unique memory ID of object.",
          "🕵️ **isinstance(obj, class)**: Checks if obj matches class.",
          "#️⃣ **hash(obj)**: Returns hash value (integer) for dict keys."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Check if x is int', solution: ['isinstance(x, int)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Get type of x', solution: ['type(x)'] }
      ]
  },
  'logic-built-3': {
      id: 'logic-built-3', title: 'Introspection', description: 'dir(), vars(), help(), callable()', totalXp: 200,
      learningContent: [
          "📂 **dir(obj)**: List attributes/methods of object.",
          "📦 **vars(obj)**: Returns `__dict__` attribute.",
          "🆘 **help(obj)**: Prints documentation.",
          "📞 **callable(obj)**: True if obj can be called like a function `()`."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'List attributes of str', solution: ['dir(str)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Is f callable?', solution: ['callable(f)'] }
      ]
  },

  // UNIT 13: FORMATTING
  'fmt-built-1': {
      id: 'fmt-built-1', title: 'Number Bases', description: 'bin(), hex(), oct()', totalXp: 200,
      learningContent: [
          "0️⃣1️⃣ **bin(x)**: Binary string. `bin(3)` -> `'0b11'`",
          "Six **hex(x)**: Hexadecimal. `hex(255)` -> `'0xff'`",
          "Eight **oct(x)**: Octal. `oct(8)` -> `'0o10'`"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Convert 10 to binary', solution: ['bin(10)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Convert 255 to hex', solution: ['hex(255)'] }
      ]
  },
  'fmt-built-2': {
      id: 'fmt-built-2', title: 'Characters', description: 'chr(), ord(), ascii()', totalXp: 200,
      learningContent: [
          "🔤 **chr(i)**: Code to Char. `chr(65)` -> `'A'`",
          "🔢 **ord(c)**: Char to Code. `ord('A')` -> `65`",
          "🇺🇸 **ascii(obj)**: Returns ASCII repr string."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get char for code 97', solution: ['chr(97)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Get code for "a"', solution: ['ord("a")', "ord('a')"] }
      ]
  },
  'fmt-built-3': {
      id: 'fmt-built-3', title: 'Representation', description: 'format(), repr()', totalXp: 200,
      learningContent: [
          "🎨 **format(value, spec)**: Formats value. `format(0.5, '%')` -> `'50.000000%'`",
          "🤖 **repr(obj)**: String for debugging/devs. `repr('hi')` -> `\"'hi'\"`"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get repr of x', solution: ['repr(x)'] }
      ]
  },

  // UNIT 14: ITERATION PRO
  'iter-built-1': {
      id: 'iter-built-1', title: 'Loop Helpers', description: 'enumerate(), zip()', totalXp: 250,
      learningContent: [
          "🔢 **enumerate(iter)**: Yields (index, value).",
          "🤐 **zip(iter1, iter2)**: Combines iterables. `zip([1],[2])` -> `(1,2)`"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Enumerate list L', solution: ['enumerate(L)'] },
          { id: '2', type: ExerciseType.WRITE_CODE, prompt: 'Zip list A and B', solution: ['zip(A, B)'] }
      ]
  },
  'iter-built-2': {
      id: 'iter-built-2', title: 'Sorting', description: 'sorted(), reversed()', totalXp: 250,
      learningContent: [
          "📊 **sorted(iter)**: Returns a new sorted list.",
          "◀️ **reversed(iter)**: Returns a reverse iterator."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Sort list L', solution: ['sorted(L)'] }
      ]
  },
  'iter-built-3': {
      id: 'iter-built-3', title: 'Manual Iter', description: 'iter(), next()', totalXp: 250,
      learningContent: [
          "👉 **iter(obj)**: Get an iterator from an object.",
          "⏭️ **next(iterator)**: Get next item manually."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get next item from `it`', solution: ['next(it)'] }
      ]
  },

  // UNIT 15: META MAGIC
  'meta-built-1': {
      id: 'meta-built-1', title: 'Attributes', description: 'getattr, setattr, delattr, hasattr', totalXp: 300,
      learningContent: [
          "These handle object attributes dynamically.",
          "• `getattr(obj, 'name')`",
          "• `setattr(obj, 'name', val)`",
          "• `delattr(obj, 'name')`",
          "• `hasattr(obj, 'name')`"
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get "x" from obj', solution: ['getattr(obj, "x")', "getattr(obj, 'x')"] }
      ]
  },
  'meta-built-2': {
      id: 'meta-built-2', title: 'Class Decorators', description: 'classmethod, staticmethod, property', totalXp: 300,
      learningContent: [
          "🏭 **@classmethod**: First arg is cls, not self.",
          "🗿 **@staticmethod**: No implicit first arg.",
          "🏠 **@property**: Access method like an attribute."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Define a property `x`', solution: ['@property\ndef x(self):'] }
      ]
  },
  'meta-built-3': {
      id: 'meta-built-3', title: 'Inheritance Helpers', description: 'super(), issubclass(), object()', totalXp: 300,
      learningContent: [
          "🦸 **super()**: Call parent class methods.",
          "👶 **issubclass(A, B)**: Is A a child of B?",
          "🧱 **object()**: The base class of all classes."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Call parent init', solution: ['super().__init__()'] }
      ]
  },

  // UNIT 16: SYSTEM & DYNAMIC
  'sys-built-1': {
      id: 'sys-built-1', title: 'Exec & Eval', description: 'eval(), exec(), compile()', totalXp: 400,
      learningContent: [
          "⚠️ **Dangerous Power!**",
          "• `eval(str)`: Evaluates string as expression. `eval('1+1')` -> 2",
          "• `exec(str)`: Executes string as code.",
          "• `compile(src, ...)`: Compiles code into AST."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Evaluate "1+1"', solution: ['eval("1+1")', "eval('1+1')"] }
      ]
  },
  'sys-built-2': {
      id: 'sys-built-2', title: 'Scope', description: 'globals(), locals()', totalXp: 400,
      learningContent: [
          "🌍 **globals()**: Dict of global variables.",
          "🏠 **locals()**: Dict of local variables."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get global variables', solution: ['globals()'] }
      ]
  },
  'sys-built-3': {
      id: 'sys-built-3', title: 'IO & Modules', description: 'open(), __import__()', totalXp: 400,
      learningContent: [
          "📂 **open(file, mode)**: Opens a file.",
          "📦 **__import__(name)**: Low-level import function."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Open "f.txt" to read', solution: ['open("f.txt", "r")', "open('f.txt', 'r')"] }
      ]
  },

  // UNIT 17: BYTES & ASYNC
  'byte-built-1': {
      id: 'byte-built-1', title: 'Bytes', description: 'bytes(), bytearray(), memoryview()', totalXp: 400,
      learningContent: [
          "💾 **bytes()**: Immutable sequence of bytes.",
          "✏️ **bytearray()**: Mutable sequence of bytes.",
          "🧠 **memoryview()**: Access internal data of objects."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Create bytes from 10', solution: ['bytes(10)'] }
      ]
  },
  'byte-built-2': {
      id: 'byte-built-2', title: 'Async Iter', description: 'aiter(), anext()', totalXp: 500,
      learningContent: [
          "⏳ **aiter(obj)**: Returns an asynchronous iterator.",
          "⏩ **anext(aiter)**: Returns next item from async iterator (awaitable)."
      ],
      exercises: [
          { id: '1', type: ExerciseType.WRITE_CODE, prompt: 'Get async iterator of x', solution: ['aiter(x)'] }
      ]
  },

  // --- UNIT 18: THE FINAL BOSS ---
  'final-boss': {
      id: 'final-boss', title: 'THE GAUNTLET', description: 'Prove your mastery.', totalXp: 1000,
      learningContent: [
          "🔥 **THE FINAL BOSS** 🔥",
          "You have learned 70+ built-in functions and concepts.",
          "This is not a drill.",
          "This lesson combines everything: Async, Meta-programming, Byte manipulation, and functional logic.",
          "Good luck, Pythonista."
      ],
      exercises: [
          { 
              id: 'boss-1', type: ExerciseType.WRITE_CODE, 
              prompt: 'Create a list of hex strings for numbers 0-2 using list comp.', 
              solution: ['[hex(x) for x in range(3)]', "[hex(i) for i in range(3)]"],
              hint: 'Use list comprehension and hex().'
          },
          { 
              id: 'boss-2', type: ExerciseType.WRITE_CODE, 
              prompt: 'Check if `bool` is a subclass of `int`.', 
              solution: ['issubclass(bool, int)'],
              hint: 'Fun fact: In Python, True is 1 and False is 0.'
          },
          { 
              id: 'boss-3', type: ExerciseType.WRITE_CODE, 
              prompt: 'Sum absolute values of list `L`: `[-10, 10]` using map.', 
              solution: ['sum(map(abs, L))'],
              hint: 'map(function, iterable) then sum it.'
          },
          { 
              id: 'boss-4', type: ExerciseType.WRITE_CODE, 
              prompt: 'Get the memory address (id) of `None`.', 
              solution: ['id(None)'],
              hint: 'Use the id() function.'
          },
          { 
              id: 'boss-5', type: ExerciseType.WRITE_CODE, 
              prompt: 'Dynamically set attribute "level" to 99 on object `player`.', 
              solution: ['setattr(player, "level", 99)', "setattr(player, 'level', 99)"],
              hint: 'setattr(obj, name, value)'
          },
          { 
              id: 'boss-6', type: ExerciseType.WRITE_CODE, 
              prompt: 'Create a bytes object from string "Py" using utf-8.', 
              solution: ['bytes("Py", "utf-8")', "bytes('Py', 'utf-8')"],
              hint: 'bytes(string, encoding)'
          },
          { 
              id: 'boss-7', type: ExerciseType.WRITE_CODE, 
              prompt: 'Use `next` and `zip` to get first pair of `[1]` and `[2]`.', 
              solution: ['next(zip([1], [2]))'],
              hint: 'zip returns an iterator, use next() to get value.'
          },
          { 
              id: 'boss-8', type: ExerciseType.WRITE_CODE, 
              prompt: 'Compile code "print(1)" for execution.', 
              solution: ['compile("print(1)", "", "exec")', "compile('print(1)', '', 'exec')"],
              hint: 'compile(source, filename, mode)'
          },
          { 
              id: 'boss-9', type: ExerciseType.WRITE_CODE, 
              prompt: 'Evaluate the length of string "Boss" inside an eval.', 
              solution: ['eval("len(\'Boss\')")', 'eval("len(\"Boss\")")'],
              hint: 'Strings inside strings require escaping quotes.'
          },
          { 
              id: 'boss-10', type: ExerciseType.WRITE_CODE, 
              prompt: 'Get the next item from an async iterator `ait`.', 
              solution: ['anext(ait)'],
              hint: 'Async version of next().'
          }
      ]
  }
};

// --- PLACEHOLDERS FOR OTHER LANGUAGES (To be populated) ---
const UNITS_ES: UnitConfig[] = []; const LESSONS_ES: Record<string, Lesson> = {};
const UNITS_FR: UnitConfig[] = []; const LESSONS_FR: Record<string, Lesson> = {};
const UNITS_DE: UnitConfig[] = []; const LESSONS_DE: Record<string, Lesson> = {};
const UNITS_IT: UnitConfig[] = []; const LESSONS_IT: Record<string, Lesson> = {};
const UNITS_PT: UnitConfig[] = []; const LESSONS_PT: Record<string, Lesson> = {};
const UNITS_RU: UnitConfig[] = []; const LESSONS_RU: Record<string, Lesson> = {};
const UNITS_ZH: UnitConfig[] = []; const LESSONS_ZH: Record<string, Lesson> = {};
const UNITS_JA: UnitConfig[] = []; const LESSONS_JA: Record<string, Lesson> = {};
const UNITS_HI: UnitConfig[] = []; const LESSONS_HI: Record<string, Lesson> = {};
const UNITS_SR: UnitConfig[] = []; const LESSONS_SR: Record<string, Lesson> = {};

// --- MERGE LOGIC FOR EXPORTS ---

// Helper: Mix English content into target language for missing keys
// This ensures the app doesn't crash if a translation is missing
const mergeWithEn = (targetLessons: Record<string, Lesson>, targetUnits: UnitConfig[]) => {
    const mergedLessons = { ...LESSONS_EN, ...targetLessons };
    // Units need special handling to match structure
    const mergedUnits = targetUnits.length > 0 ? targetUnits : UNITS_EN;
    
    // If target units are short (e.g. only 1 unit defined), append English units 2-7
    if (mergedUnits.length < UNITS_EN.length) {
        return { lessons: mergedLessons, units: [...mergedUnits, ...UNITS_EN.slice(mergedUnits.length)] };
    }
    return { lessons: mergedLessons, units: mergedUnits };
};

export const getLessons = (lang: AppLanguage): Record<string, Lesson> => {
    switch(lang) {
        case 'sr': return { ...LESSONS_EN, ...LESSONS_SR }; // Merge SR
        case 'es': return mergeWithEn(LESSONS_ES, UNITS_ES).lessons;
        case 'fr': return mergeWithEn(LESSONS_FR, UNITS_FR).lessons;
        case 'de': return mergeWithEn(LESSONS_DE, UNITS_DE).lessons;
        case 'it': return mergeWithEn(LESSONS_IT, UNITS_IT).lessons;
        case 'pt': return mergeWithEn(LESSONS_PT, UNITS_PT).lessons;
        case 'ru': return mergeWithEn(LESSONS_RU, UNITS_RU).lessons;
        case 'zh': return mergeWithEn(LESSONS_ZH, UNITS_ZH).lessons;
        case 'ja': return mergeWithEn(LESSONS_JA, UNITS_JA).lessons;
        case 'hi': return mergeWithEn(LESSONS_HI, UNITS_HI).lessons;
        default: return LESSONS_EN;
    }
}

export const getUnits = (lang: AppLanguage): UnitConfig[] => {
    switch(lang) {
        case 'sr': return UNITS_SR.length > 0 ? UNITS_SR : UNITS_EN;
        case 'es': return mergeWithEn(LESSONS_ES, UNITS_ES).units;
        case 'fr': return mergeWithEn(LESSONS_FR, UNITS_FR).units;
        case 'de': return mergeWithEn(LESSONS_DE, UNITS_DE).units;
        case 'it': return mergeWithEn(LESSONS_IT, UNITS_IT).units;
        case 'pt': return mergeWithEn(LESSONS_PT, UNITS_PT).units;
        case 'ru': return mergeWithEn(LESSONS_RU, UNITS_RU).units;
        case 'zh': return mergeWithEn(LESSONS_ZH, UNITS_ZH).units;
        case 'ja': return mergeWithEn(LESSONS_JA, UNITS_JA).units;
        case 'hi': return mergeWithEn(LESSONS_HI, UNITS_HI).units;
        default: return UNITS_EN;
    }
}