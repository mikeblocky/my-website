<script lang="ts">
  import BlogPostTemplate from '../../../../lib/components/BlogPostTemplate.svelte';
</script>

<BlogPostTemplate
  title="Getting Started with Machine Learning"
  date="December 25, 2024"
  readingTime="10 min read"
  slug="getting-started-with-machine-learning"
  themes={["Computer Science"]}
>
  <div class="flex flex-col gap-4 text-left font-sans text-slate-800 dark:text-slate-200">
    <section id="introduction" class="space-y-4">
      <p><u><strong>Disclaimer</strong></u>: I am not an expert; I'm a learner, and I've just outlined what has worked for me and although I have tried making it more general, this could still, to some extent, be a subjective list.</p>
      
      <p class="font-bold">This list assumes the following:</p>
      <ol class="list-decimal pl-6 space-y-2">
        <li>that you have no prior background when it comes to machine learning</li>
        <li>that you have completed high school math (maybe you've forgotten, but that's okay)</li>
        <li>that you don't know much about Python but aren't too unfamiliar with programming languages. If you know some Python, awesome. If you're an expert, even better. If you know another programming language, that'll help a lot! You more or less know where you fit here so move forward accordingly; let's assume that you are a beginner in Python (or programming in general).</li>
      </ol>
      
      <p>There's no particular order to this, and the resources I suggest could be subjective. As a learner, you're free to roam around, but having some basic foundation when it comes to math & programming (Python) is key.</p>
      
      <p>I'm going to paste some materials below. These aren't necessarily in order.</p>
      
      <p>
        My suggestion: complete <a href="#math" class="text-teal-600 dark:text-teal-400 font-bold hover:underline">[1]</a>, get some basic understanding of Python (and some PyTorch too if you have time) in <a href="#programming" class="text-teal-600 dark:text-teal-400 font-bold hover:underline">[2]</a> (you do not need to master Python or PyTorch! learn as you go!), complete the 3B1B playlist from <a href="#nn-3b1b" class="text-teal-600 dark:text-teal-400 font-bold hover:underline">[3.1.1]</a> — make sure you have a basic high-level understanding of the concepts — and start <a href="#ml-hands-on" class="text-teal-600 dark:text-teal-400 font-bold hover:underline">[3.2]</a>. The rest can be done concurrently with something else. Even if you skip some parts, make sure you come back to complete it. When I say this, I'm not talking about the course, but the topic!
      </p>
      
      <div class="p-4 rounded-lg border border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-800/40 dark:bg-emerald-950/20 my-4">
        <span class="font-bold text-emerald-800 dark:text-emerald-300">Note:</span> If you find something from below not good enough or interactive, it's okay to refer to something else to cover that topic. It's all subjective, anyway. You probably know what works best for you. What's important is that you cover that topic in some way.
      </div>
      
      <p>Okay, here's the list.</p>
    </section>

    <hr class="my-6 border-slate-200/50 dark:border-slate-800/50" />

    <section id="math" class="space-y-4">
      <h2 class="text-xl font-bold mt-8 mb-4">1. Math</h2>
      <p>Again, this could be subjective but its important to get the absolute foundations down. So, I suggest:</p>

      <h3 class="text-lg font-bold mt-6 mb-2">1.1 Math for ML Specialization</h3>
      <p>This specialization covers basic linear algebra, calculus, and statistics required for ML. You don’t need to pay; just audit the courses.</p>
      <p>This series offers a basic fundamental understanding only, which I consider important since being able to understand mathematical intuition is super essential, even if it’s just a basic one.</p>
      <p>Here's the <a href="https://www.coursera.org/specializations/mathematics-for-machine-learning-and-data-science" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">specialization link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 class="text-lg font-bold mt-6 mb-2">1.2 Essence of Linear Algebra by 3Blue1Brown</h3>
      <p>I highly recommend this. The material is in YouTube video format as well as reading format. You can watch/do this concurrently with the linear algebra course above.</p>
      <p>Here's the <a href="https://www.3blue1brown.com/topics/linear-algebra" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">playlist link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 class="text-lg font-bold mt-6 mb-2">1.3 Differential Equations by 3Blue1Brown</h3>
      <p>I highly recommend this playlist as well. YouTube playlist as well as text format available. You can watch/do this concurrently with the calculus course above.</p>
      <p>Here's the <a href="https://www.3blue1brown.com/topics/differential-equations" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">playlist link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 class="text-lg font-bold mt-6 mb-2">1.4 Essence of Calculus by 3Blue1Brown</h3>
      <p>This is my other highly recommended playlist series. YouTube playlist as well as text format available. You can watch/do this concurrently with the calculus course above.</p>
      <p>Here's the <a href="https://www.3blue1brown.com/topics/calculus" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">playlist link</a>.</p>

      <div class="p-4 rounded-lg border border-red-200/60 bg-red-50/30 dark:border-red-800/40 dark:bg-red-950/20 my-4">
        <span class="font-bold text-red-800 dark:text-red-300">Disclaimer Regarding the 3B1B Courses:</span> These courses are for getting a high-level preview of the concepts — some sort of a mental model — and are not necessarily to be relied upon for purely learning. For that, you need paper, a pen, and some proper math exercises to solve.
      </div>

      <p>This is where my next suggestion comes in.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 id="math-academy" class="text-lg font-bold mt-6 mb-2">1.5 Mathematics for Machine Learning, Math Academy</h3>
      <p>Not for someone who wants to get the basics done and jump into machine learning relatively quickly. This is a paid course ($49/month) but if you are willing to learn serious math for machine learning (which I highly recommend if you can afford the monthly subscription), this is the best place for ml math (or any sort of math for that matter). My biggest revelation of 2024 has been this website, and this thing ensures you learn. The scaffolding this site applies is something I have never seen anywhere else, and the spaced repetition alongside the site's AI that closely monitors your progress -- always tracking your strengths and weaknesses -- is something I regard one of the best things I've ever seen. This is the best way to learn math, and I highly recommend it. If you're willing to take this route, you do not need to take any math for ml courses anywhere else (except for maybe the 3B1B courses to craft some mental models).</p>
      <p>You can take a look at how this site works <a href="https://www.mathacademy.com/how-it-works" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">here</a>. I am not affiliated with this site by any means; I just think it's that good.</p>
      <p>Here's the <a href="https://www.mathacademy.com/courses/mathematics-for-machine-learning" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">course link</a>.</p>
    </section>

    <hr class="my-6 border-slate-200/50 dark:border-slate-800/50" />

    <section id="programming" class="space-y-4">
      <h2 class="text-xl font-bold mt-8 mb-4">2. Programming</h2>
      <p>Although I'm pretty sure this is something you might already know where to look at to learn, allow me to still paste some materials below and you can see if they might be helpful to you.</p>

      <h3 id="practical-python" class="text-lg font-bold mt-6 mb-2">2.1 Practical Python by Dabeaz</h3>
      <p>I really like this course. It's got roughly 40 hours of intense work that's done mostly in the terminal (which I believe is a great thing to get used to), focusing mainly on script writing, basic data manipulation, and program organization. It's an awesome way to get started with serious Python.</p>
      <p>Here's the <a href="https://github.com/dabeaz-course/practical-python" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">course link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 id="pytorch-zero-to-mastery" class="text-lg font-bold mt-6 mb-2">2.2 PyTorch - Zero to Mastery by Daniel Bourke</h3>
      <p>PyTorch is arguably the most popular library for deep learning, and it's the one that's used in most of the research papers. It's a very powerful library that allows us to do a lot of things such as manipulating multiple dimensions of data, implementing and training neural networks, and more.</p>
      <p>Now, let us swing back to the topic of this PyTorch book. I absolutely adore this series. It's primarily an online book, with a 24-hour YouTube video available (covering the first 5 chapters out of 10) if you're more a video format person (I personally think just referring to the book is fine, but it's up to you). This takes us from the absolute basics of PyTorch and many machine learning concepts in a hands-on, code-first way all the way till implementing a research paper. It's a great way to get started with PyTorch.</p>
      <p>Here's the <a href="https://www.learnpytorch.io/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">course link</a> and the <a href="https://youtu.be/Z_ikDlimN6A" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">YouTube video link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 class="text-lg font-bold mt-6 mb-2">2.3 Official NumPy Docs</h3>
      <p>NumPy is a very important library for manipulating data (mostly in the form of arrays when it comes to machine learning). Alongside PyTorch, this is another library that we must know about. PyTorch and NumPy may seem similar, but the main difference lies in the computation: Pytorch tensors (think of them as n-dimensional matrices) are similar to numpy arrays, but can also be operated on GPU. Numpy arrays are mainly used in typical machine learning algorithms (such as k-means or Decision Tree in scikit-learn) whereas PyTorch tensors are mainly used in deep learning which requires heavy matrix computation. You can take a look at this <a href="https://www.kaggle.com/code/amirmotefaker/pytorch-vs-numpy" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">document</a> for a quick comparison.</p>
      <p>I recommend completing the <a href="https://numpy.org/doc/stable/user/absolute_beginners.html" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">absolute basics</a> and the <a href="https://numpy.org/doc/stable/user/basics.html" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">fundamentals</a> sections from the official NumPy documentation to get started.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 id="pytorch-official-docs" class="text-lg font-bold mt-6 mb-2">2.4 Official PyTorch Docs</h3>
      <p>This is the official PyTorch documentation. I highly recommend firstly going through the PyTorch book by Daniel Bourke from <a href="#pytorch-zero-to-mastery" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">above</a>, and then using this documentation as a reference. We do not necessarily need to learn or know everything from it; we just need to know where to look at when we need to.</p>
      <p>Here's the <a href="https://pytorch.org/docs/stable/index.html" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">official documentation link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h3 id="advanced-python" class="text-lg font-bold mt-6 mb-2">2.5 Advanced Python Mastery by Dabeaz</h3>
      <p>This course can be thought of as a more advanced version of the Practical Python course. It is not meant for beginners, but for those who have a good grasp of Python and want to learn more advanced topics; therefore, if you want to skip this one, it is completely fine. That being said, if you want to move beyond writing scripts to writing more sophisticated programs and build a more complete mental model of the Python language itself and how it works, this is the course for you.</p>
      <p>Here's the <a href="https://github.com/dabeaz-course/python-mastery" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">course link</a>.</p>
    </section>

    <hr class="my-6 border-slate-200/50 dark:border-slate-800/50" />

    <section id="ml-stuff" class="space-y-4">
      <h2 class="text-xl font-bold mt-8 mb-4">3. The "ML" Stuff</h2>
      <p>This section is where I'm going to list out some of the resources I've found useful for getting started with machine learning. People have their own views on how to start this as well, so I’ll list out the ones that worked (and are working) pretty well for me.</p>

      <h3 class="text-lg font-bold mt-6 mb-2">3.1 The "Theory" Stuff</h3>
      
      <h4 id="nn-3b1b" class="text-md font-bold mt-4 mb-2">3.1.1 The Neural Network Playlist by 3Blue1Brown</h4>
      <p>I consider these videos incredibly intuitive and highly recommend watching this before getting into the crux of machine learning to get a high-level understanding of the concepts. Text format available too!</p>
      <p>Here's the <a href="https://www.3blue1brown.com/topics/neural-networks" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">site link</a> and the <a href="https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">YouTube playlist link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h4 class="text-md font-bold mt-4 mb-2">3.1.2 Machine Learning Specialization by Andrew Ng</h4>
      <p>Andrew Ng is one of the most well-regarded teachers and pionners in the field of Machine Learning, and this recently revised specialization, with its 3 courses, is a great way to get started with the basics of the theory side of machine learning. This specialization also has labs, which, if you have full access to the course, can be done in Python. It does make use of TensorFlow, but you can easily do the labs on your own in PyTorch (or even JAX!) if you want.</p>
      <p>Here's the <a href="https://www.coursera.org/specializations/machine-learning-introduction" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">course link</a>.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h4 class="text-md font-bold mt-4 mb-2">3.1.3 ML Playlist by Statquest</h4>
      <p>I like to think of Josh Starmer's channel as my go-to for learning anything machine learning or statistics related whenever I run into a concept that I find difficult to understand. I believe his videos are interactive and intuitive, and I use his Statquest videos on ML for reference (just like the PyTorch docs). I recommend you do this as well if you feel like it :)</p>
      <p>Here's the <a href="https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">YouTube playlist link</a>.</p>

      <hr class="my-6 border-slate-200/50 dark:border-slate-800/50" />

      <h3 id="ml-hands-on" class="text-lg font-bold mt-6 mb-2">3.2 The Hands-On Approach</h3>
      <p>As the heading suggests, this section is about the hands-on approach to machine learning. This is where we get our hands dirty and start building things, and personally, I think this is the only way to actually learn to do machine learning. Everything so far has been to lead us to this point, and I think this is the quintessential part of the entire process.</p>

      <h4 class="text-md font-bold mt-4 mb-2">3.2.1 Machine Learning with PyTorch and Scikit-Learn by Raschka - Liu - Vahid</h4>
      <p>The topics that this book covers ranges from traditional machine learning concepts (covering the fundamental concepts surrounding machine learning, including preprocessing the data, model evaluation, hyperparameter tuning, etc.) making use of mainly <a href="https://scikit-learn.org/stable/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">scikit-learn</a> to deep learning (such as CNNs, RNNs, Transformers, parallelization, GNNs, Reinforcement Learning, etc.) using PyTorch. It's a ridiculously packed book, and I highly recommend it.</p>
      <p>If you are interested in knowing more about the topics covered in this book, you can take a look at the <a href="https://sebastianraschka.com/books/machine-learning-with-pytorch-and-scikit-learn/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">book link</a>, <a href="https://sebastianraschka.com/books/machine-learning-with-pytorch-and-scikit-learn/#preface" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">its detailed table of contents</a>, and <a href="https://sebastianraschka.com/blog/2022/ml-pytorch-book.html" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">the blog by the author</a> explaining the book content.</p>

      <hr class="my-4 border-slate-200/30 dark:border-slate-800/30" />

      <h4 class="text-md font-bold mt-4 mb-2">3.2.2 Neural Network - Zero to Hero Series by Andrej Karpathy</h4>
      <p>Andrej Karpathy is one of the most, if not the most, well-regarded instructors in the field of deep learning, and it's incredible that a series like this with its level of quality and detail is available for free. He takes a very hands-on approach to teaching, starting from absolute basics of python classes, derivatives, gradient descent, micrograd, then from a bigram counting model to makemore, nanoGPT, tokenizers, and more.</p>
      <p>As of December 2024, the series is up to 8 parts, and I highly recommend you go through each and every one of them and replicate what he teaches. Andrej is an incredible teacher; all the concepts, regardless of their difficulty, that he illustrates in his videos are extremely well-explained, and the way he builds up everything is something I think is second to none.</p>
      <p>Here's the <a href="https://github.com/karpathy/nn-zero-to-hero" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">link to the series</a>.</p>
    </section>

    <hr class="my-6 border-slate-200/50 dark:border-slate-800/50" />

    <section id="resources" class="space-y-4">
      <h2 class="text-xl font-bold mt-8 mb-4">4. Some More Resources</h2>
      <p>
        Do some small-scale side projects too! <a href="https://www.kaggle.com/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">Kaggle</a> is nice. Also, try to consume as much as you can from people like <a href="https://sebastianraschka.com/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">Sebastian Raschka</a> in addition to <a href="https://karpathy.ai/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">Andrej Karpathy</a>.
      </p>
      
      <p>
        You can try reading some ml-related books and read some papers as well. Here are some books I was told are good (<strong>I have not yet read them all, so please check them out with your own curiosity</strong>). Links are provided for each book.
      </p>
      
      <ol class="list-decimal pl-6 space-y-2">
        <li><a href="https://udlbook.github.io/udlbook/" target="_blank" class="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">Understanding Deep Learning by Simon Prince</a></li>
        <li><a href="https://www.sscardapane.it/alice-book/" target="_blank" class="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">Alice's Adventures in Differentiable Wonderland by Scardapane</a></li>
        <li><a href="https://github.com/chiphuyen/dmls-book" target="_blank" class="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">Designing Machine Learning Systems by Chip Huyen</a></li>
        <li><a href="https://www.manning.com/books/build-a-large-language-model-from-scratch" target="_blank" class="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">Build a Large Language Model from Scratch by Sebastian Raschka</a></li>
      </ol>
      
      <p>
        <strong>For papers</strong>, it's quite open but you can take a look at the links below for a kickstart:
      </p>
      
      <ol class="list-decimal pl-6 space-y-2">
        <li><a href="https://github.com/dair-ai/ML-Papers-Explained" target="_blank" class="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">ML Papers Explained by dair.ai</a></li>
        <li><a href="https://github.com/labmlai/annotated_deep_learning_paper_implementations" target="_blank" class="hover:text-teal-600 dark:hover:text-teal-400 hover:underline">Annotated Deep Learning Paper Implementations by labml.ai</a></li>
      </ol>

      <p>
        I also really like <a href="https://ml-resources.vercel.app/" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">this site</a> that lists out tons of ml resources created by learners and experts alike.
      </p>

      <p>
        Lastly, if you want to be a part of the community of driven learners, you can take a look at all the people I follow on <a href="https://x.com/sumitdotml/following" target="_blank" class="hover:underline text-teal-600 dark:text-teal-400 font-bold">Twitter</a>. These are some of the most active and amazing people I've met online, and I've learned a lot from them.
      </p>
      
      <p>
        Good luck!
      </p>
    </section>
  </div>
</BlogPostTemplate>
