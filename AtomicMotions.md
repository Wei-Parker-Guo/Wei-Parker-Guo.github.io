---
layout: post
title: "Atomic Motions: towards bottom-up motion synthesis for digital humans"
permalink: /atomic_motions
sidebar_link: false
---

**Please be aware that this content is subject to significant changes until Jan.25, 2024.**

Digital humans should perform humanlike behaviors. The basic human behavior is motion. What creates motion? Unlike natural language or DNA, the fundamental building blocks of motion are unclear. The lack of a bottom-up approach motivates many motion synthesis works to model lower-level elements of motion. These endeavors have achieved significant progress over the past two decades with the boost of machine learning algorithms. I dedicate my time to cook the most motions with the least ingredients possible. Analogous to the periodic table of atoms, I hypothesize that there exist "atomic motions" that exhibit high data efficiency in modeling motion structures and dynamics. Based on atomic motions, I model motion synthesis as an autonomous structuring-planning-executing process. I will discuss recent trends in motion synthesis, introduce my atomic motions model, and use recent findings from computer graphics and neuroscience to support my approach's validity for further investigation. I will wrap up by outlining challenges and forecasting my future research activities.

## Video
---

Available in <b style="text-align: center;" class="countdown" date="Jan 25, 2024 00:00:00"></b>.

## Introduction
---
How do we create motion, or perform "motion synthesis"?

Despite not fully understanding how the human brain generates motion, we can capture the resulting movements effectively. In computer graphics, motion is shown as frames of human skeleton model states. Employed to rig a human body model and rendered sequentially, these frames appear as fluent actions and convince you a digital human is playing basketball or dancing.

This seems promising. If motions are simply sequential skeleton states, can we generate these states to synthesize motion?

Suppose we have a fixed duration of time and combine all possible states into a "motion space." This theoretical space doesn't truly match the realistic range of human motion, which is much smaller. Using skeleton states directly for motion synthesis would require immense computational efforts to weed out nonsensical results, especially with variable durations.

|                | DNA         | Natural Language | Human Motion |
| -------------- | ----------- | ---------------- | ------------ |
| building block | Nucleobases | Words            | ?            |

In contrast, other synthesis tasks in genetics, linguistics, and architecture have clear building blocks such as nucleobases, words, and bricks, making the challenge more about enhancing efficiency and innovative output, not the basics of construction. Claiming the ability to synthesize DNA or language is clear-cut, but when it comes to motion, we must ask: synthesize from what?

So, I propose that before building more larger and more complex models from recent motion synthesis methods, we must revisit the essential question: **what constitutes the building blocks of motion?**

## Past Hypotheses
---
Many ideas have been formed regarding the building blocks of motion. Let's browse them quickly before we draw our own hypothesis about atomic motions.

Of course Plato was the among the first ones to say something about this subject. He went all meta-physical about it. In Phaedrus, he argued that soul, the self-mover, is accountable for creating motions. Since we can't compute a soul, let's move on to recent works.

Come to 2000s, motions are synthesized from **editable motion templates**. These templates can be motion clips, local scene animations or graphs. The idea is to search for suitable templates for the motion synthesis task, and either compose them w.r.t. an optimization algorithm, or interpolate them w.r.t. to some kernel to produce the desired motion.

By the 2010s, several new concepts emerged:
1. Motions can be modeled as **paths of exploration in the motion space** to accomplish a certain synthesis objective. To obtain a decent path, you can employ reinforcement learning or path finding algorithms.
2. Motions can be modeled as **state transitions in a Markov chain**. The states can be frame-wise or snippet-wise, and the transitions are predicted by a time series model. These models are often autoregressive so you can supply an initial state and synthesis conditions to obtain the desired motion.
3. Motions can be modeled as **high-dimensional motion states residing on a low-dimensional manifold**. This manifold often models both space and time so you can pinpoint a local part of an atomic motion. The motion dataset, projected to the low-dimensional space, is interpolated to construct the manifold. A motion can then be synthesized piece-by-piece by searching this manifold with different conditions.

In 2020s, the motion manifold model becomes more popular because it can easily be made generative with variational methods. Meanwhile, the rise of large language models stirred up some new ideas in motion synthesis.
1. First of all, we are synthesizing motions by sampling them from **probabilisitic space-time manifolds**, which approximates the distribution of the given motion data variationally. One thing worth noticing is that with the success of implicit neural representations such as NERF in other domains, the manifold can be sample-wisely constructed to have a much finer structure.
2. The NLP-flavored models synthesize motions by treating them as **language prompts**. They attempt to fuse the synthesis conditions into a sequential structure, and train a neural machine translator to translate this sequence into a motion sequence. Often, a discrete codebook is learned with an autoencoder to obtain the "vocabulary" in the motion domain first.
3. Another very exciting work is done in neuroscience: the **attractor hypothesis** models motion planning as a dynamic system of neural activities. A motion state during planning is formulated as a rolling ball on the activity landscape, and an attractor forms a valley which can trap the ball. Unlike previous models seen so far, the attractor hypothesis models the **"planning-commitment-execution"** process of motion, which is a more complete picture. Also, it's the first motion model to have supports in neuroscience experiments.

We should keep in mind that these ideas, once emerged, seldom become obsolete. For example, the idea of template editing, such as motion matching, has been extended all the way from 1980s to 2023.

## Top-down or Bottom-up?
---
Nevertheless, we can see that there is a tendency of recent ideas to drift from a top-down approach towards a bottom-up one in modeling the building blocks of motion. In 2003, we view a motion clip as a template for us to tweak into new motions. Today, we often extract low-level motion features from the motion dataset and compose motions from them instead.

The top-down and bottom-up approaches are analogous to two ways of designing rocket engines: in the face of a new mission, you can either envelop the design of an old, working version with tweaks, or you can build a new engine from individually-verified parts. The difference is: in the top-down workflow we really don't know if the tweaks will cause any new problems. One tweak leads to further tweaks. In worst case, one of the subsequent tweaks form a cycle with the previous tweak, and the whole process is stuck in a local optimum loop.

In the bottom-up one, however, your structure grows each time knowing the lower-level works. This additional knowledge is crucial to make your engine building efficient:

1. we are no longer stuck in subpar optimization or optimization conflicts.
2. the novelty of an engine design can often be predetermined, when your structure begins to differ from existent ones in any level. Moreover, we can quantify how novel your engine is.
3. when the mission suddenly changes, it's very easy to replace parts of a bottom-up engine, but it's substantially harder to edit a top-down one.

Motion synthesis benefits from a bottom-up workflow in similar aspects as engine design. We are only starting on this this trend.

## Atomic Motions: a New Hypothesis
---
Finally, we are ready to draw a new hypothesis in the spirit of **"going the extra mile in bottom-up approaches"**.

Most bottom-up approaches today have these assumptions:
1. Motion is synthesized by arranging the building blocks in a uniform, single-level structure.
    1. In motion manifolds, the structure is often a non-hierarchical hypersphere or a multivariate normal distribution.
    2. In codebook models, the structure is a sequence of codes.
2. Due to these structures, interactions of different building blocks are roughly described, each block usually has
    1. a simple set of affinities, usually nonspecific to each other block.
    2. a simple set of aversions, usually nonspecific to each other block.

Instead, my hypothesis on atomic motions make the following assumptions:
1. The structure of a motion is synthesized by arranging atomic motions in distinct, multi-level structures.
    1. For example, MotionCLIP aligns the structure of its motion manifold towards a language model, and successfully synthesizes out-of-distribution motions. Given that the language model has a very different embedding structure than a motion manifold, this extra aligning can be viewed as adding a second-level structure onto the manifold.
    2. In real world, complex motions are also generated by composing simpler motions dynamically in multiple levels. For instance, you learn how to dance from composing a few basic moves. These basic moves are further formed from some body-part-specific or phase-specific "sub-moves". When hearing a new piece of music, most dancers can improvise by building up their higher-level moves from a different set of sub-moves, and composing the new moves into a new dance. The sub-moves stay constant, but the moves become novel by dynamically accumulating them w.r.t. the tempo of music, adding more foot stepping when it's quick, or more foot sliding when it's slow.
2. Affinity between each pair of atomic motions is generally distinct.
    1. We can see this in autoregressive models' tendency to predict averaged motions because of the ambiguity in future frames suggested by previous frames. RCMTC resolves this artifact successfully by disambiguating the predictor with mixture of experts. The implication is that there is more than one motion transition available from an existing motion, but these transitions do have different probabilities of appearing under different synthesis conditions. Therefore, atomic motions must have different affinities between each other for this probability distribution to be nonuniform.
    2. As a real world example, punching with a left fist is more likely to be followed by retracting that fist, but it's also completely ok to follow it with a right punch. However, we are more likely to do the first one to maintain balance.
3. Aversions between each pair of atomic motions is generally distinct.
    1. ASE employs an additional skill discovery objective to diversify its motion manifold as much as possible. This objective has achieved significantly higher motion synthesis quality. It suggests that there are different motions transitions rejected for different existent motions, or else there is no need to encourage diversification since every motion can accept all transitions.
    2. In the real world, we are unlikely to compose a motion that exhibits both swimming and walking movements. However, it's very likely that a motion includes elements of both running and walking.
4. The dynamics of a motion is synthesized by evolving a dynamic system in the state space, where the fixed points express atomic motions.
    1. The attractor hypothesis has shown how motor planning is committed through neural dynamics, where the attractors slowly trap a motion state to desired stable states. This hypothesis has estimated correct behaviors of mice in optogenetic perturbation experiments.
    2. In the real world, each motion has a planning-commitment-execution process. We can quickly adjust our planned motions when the stimuli suddenly changes. However, this is not modeled well by current methods, such as in NSM, where the motion artifacts such as jiggling occur in face of a sudden control signal change.

With these assumptions, I propose a three-stage bottom-up motion synthesis framework. First, we extract the atomic motions and determine their structuring properties. Secondly, we synthesize appropriate structure of a motion according to synthesis conditions. Lastly, we evolve a dynamic system on this structure to synthesize the dynamics of a motion.

When illustrating these stages below, I'm using examples from my current modeling ideas. Keep in mind they are subject to substantial changes in future experiments.

### Proposed Model of Atomic Motions
Available in <b style="text-align: center;" class="countdown" date="Jan 20, 2024 00:00:00"></b>.

## Implications
---
Available in <b style="text-align: center;" class="countdown" date="Jan 21, 2024 00:00:00"></b>.

## Challenges
---
Available in <b style="text-align: center;" class="countdown" date="Jan 22, 2024 00:00:00"></b>.

## Research Forecast
---
Available in <b style="text-align: center;" class="countdown" date="Jan 23, 2024 00:00:00"></b>.

## References
---
Available in <b style="text-align: center;" class="countdown" date="Jan 30, 2024 00:00:00"></b>.


<script src="../assets/js/countdown.js"></script>

