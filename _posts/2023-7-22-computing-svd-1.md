---
layout: post
title: "The ABCs of Computing SVD: Bidiagonal Reduction and Implicit Symmetric QR Algorithms"
categories: 
- Math
tags:
- SVD
- Linear Algebra
- QR Algorithm
- Algorithm
---

Reading Time: 14 min 25 sec

![](/assets/img/2023-7-22/bulldozer.jpeg "A bulldozer is removing a bulge of dirt, leaving a trail on the flat beach.")

## Problem
SVD is a powerful decomposition that works for singular matrices. It solves many linear algebra problems out of the box, such as finding matrix range, nullspace, basis vectors and solving linear systems.

Recall that SVD takes the following form:

$$\mathbf{A}=\mathbf{U}\mathbf{\Sigma}\mathbf{V}^T,$$

where $\mathbf{U}$ is an $m \times n$ column-orthogonal matrix, $\mathbf{\Sigma}$ is an $n \times m$ diagonal matrix, $\mathbf{V}$ is an $n \times n$ column-orthogonal matrix.

Although we use SVD frequently, most usage focus on its implications instead of inner mechanisms. The computation of an SVD is often treated as a black box. This treatment is analogous to 囫囵吞枣 (swallowing without chewing), resulting in some loss of insights for problem solving.

**The problem for this investigation, therefore, is on how to compute SVD efficiently.** Specifically, we are gonna compare different methods to make our judgements.

This is **part 1** of our investigation. We are gonna survey two particularly important methods:
1. The reduction of a general matrix $\mathbf{A}$ to its upper bidiagonal form $\mathbf{B}$, which serves as the first step in many SVD algorithms.
2. A particular SVD algorithm family that's analogous to computing the symmetric QR algorithm implicitly.

In the subsequent parts, we are gonna explore other method families: high relative accuracy, divide-and-conquer and Jacobi methods. For now, let's focus on the two methods mentioned above. Together they build a good foundation for our investigation. The methods in 2 are among the precursors of SVD algorithms (developed in the 60s and 70s), but are still widely used today because of their robustness.

## Observations
For an $m \times n$ matrix $\mathbf{A}$ of rank $r$, there is a close connection from its SVD to its **Eigenvalues and Eigenvectors**:

|      | SVD Property                                         | Eigen Property                                               | Expression                                                   |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | $r$ positive diagonal elements of $\mathbf{\Sigma}$. | Square roots of $r$ positive eigenvalues of $\mathbf{A}^T\mathbf{A}$. | $\mathbf{A}^T\mathbf{A}\mathbf{v}\_j=\sigma^{2}\mathbf{v}\_j$ |
| 2    | Columns of $\mathbf{V}$.                             | Normalized eigenvectors of $\mathbf{A}^T\mathbf{A}$.         | $\sigma_{j}\mathbf{u}_{j}=\mathbf{A}\mathbf{v}_j$            |
| 3    | Columns of $\mathbf{U}$.                             | Normalized eigenvectors of $\mathbf{A}\mathbf{A}^T$ .        | $\sigma_{j}\mathbf{v}_{j}=\mathbf{A}^T\mathbf{u}_j$          |

An immediate observation here is that we can **obtain SVD of $\mathbf{A}$ by computing the eigenvalues of $\mathbf{A}^T\mathbf{A}$**. Once we get the eigenvalues ($\mathbf{\Sigma}$) and corresponding eigenvectors $\mathbf{V}$, $\mathbf{U}$ can be obtained through relationship 2.

The problem is then reduced to **finding eigenvalues of $\mathbf{A}^T\mathbf{A}$**.

### The Naive Symmetric QR Algorithm
A straightforward way to obtain eigenvalues of a general matrix is through the [symmetric QR Algorithms](https://www.cs.utexas.edu/users/flame/Notes/NotesOnSymQR.pdf) [^7]. Since $\mathbf{A}^T\mathbf{A}$ is a symmetric square matrix, the algorithm yields a [Schur decomposition](https://en.wikipedia.org/wiki/Schur_decomposition):

$$\mathbf{A}^T\mathbf{A}=\mathbf{Q}\mathbf{R}\mathbf{Q}^{-1}=\mathbf{V}\mathbf{\Sigma}^T\mathbf{\Sigma}\mathbf{V}^T.$$

Note that the decomposition above has a diagonal $\mathbf{R}$ containing eigenvalues, and $\mathbf{Q}$ containing eigenvectors, because $\mathbf{A}^T\mathbf{A}$ is a normal matrix.

Once we obtain $\mathbf{\Sigma}$ and $\mathbf{V}$, we can utilize expression 2 to obtain $\mathbf{U}$ through another QR decomposition.

By **explicitly computing $\mathbf{A}^T\mathbf{A}$, we incur significant loss of information** due to floating point error, since the condition number of $\mathbf{A}$ is now squared. Thus, the naive QR algorithm is **not a good choice** for SVD!

The problem now boils down to this: **find the eigenvalues of $\mathbf{A}^T\mathbf{A}$ without actually computing $\mathbf{A}^T\mathbf{A}$**.

## Reduction to Bidiagonal Form
Given a general matrix $\mathbf{A}$, suppose we can transform it into an upper bidiagonal form $\mathbf{B}$ as:

$$\mathbf{U}^{T}_{B} \mathbf{A} \mathbf{V}_{B} =\mathbf{B} ,$$

where $\mathbf{U}_B$ and $\mathbf{V}_B$ are orthogonal. Then the following manipulation yields a **symmetric tridiagonal matrix** $\mathbf{T}$:

$$\mathbf{T} =\mathbf{B}^{T} \mathbf{B} =\mathbf{V}^{T}_{B} \mathbf{A}^{T} \mathbf{A} \mathbf{V}_{B} .$$

Notice that $\mathbf{T}$ is essentially a similarity transform of $\mathbf{A}^T\mathbf{A}$. Therefore, it has the same eigenvalues and eigenvectors. However, due to the symmetric tridiagonal form forming a **Sturm sequence**, the eigenvalues of $\mathbf{T}$ can be determined much more effectively and accurately (see Wilkinson's bisection method and MR<sup>3</sup> for details, a good intro is in [these slides](https://www5.in.tum.de/lehre/vorlesungen/parnum/WS16/lecture_12.pdf) [^8]).

This is just an illustration of concept. We are not gonna use $\mathbf{T}$ explicitly as it still contains $\mathbf{A}^T\mathbf{A}$. Instead, we use $\mathbf{B}$ as an intermediate step to complete the implicit eigenvalue extraction.

### Householder Reflection: A Review
Recall that a Householder reflector takes the form:

$$\mathbf{H} = \mathbf{I} - 2\mathbf{u}\mathbf{u}^T, \ || \mathbf{u} || = 1.$$

We can transform a vector or matrix by multiplying it with $\mathbf{H}$:

$$\mathbf{H}\mathbf{x}=\mathbf{x} - \mathbf{u}(2\mathbf{u}^T)\mathbf{x}.$$

What we do most of the time is to transform a vector $\mathbf{x}$ on a multiple of a unit vector $\mathbf{e}_1$, where the first element is 1 and the rest are 0. In this manner we can **zero out column elements below the first column entry**.

If the multiplicity is some term $\alpha$, then we have the following expression:

$$\mathbf{H} \mathbf{x} =\mathbf{x} -\mathbf{u} (2\mathbf{u}^{T} )\mathbf{x} =\alpha \mathbf{e}_{1}.$$

Notice that since $\mathbf{H}$ is unitary, the Householder reflection preserves the norm of $\mathbf{x}$. Therefore, we can define an expression to respect this constraint[^2]:

$$\begin{gathered}\alpha =\rho ||\mathbf{x} ||,\\ \mathbf{u} =\frac{\mathbf{x} -\rho ||\mathbf{x} ||\mathbf{e}_{1} }{||\mathbf{x} -\rho ||\mathbf{x} ||\mathbf{e}_{1} ||} =\frac{1}{||\mathbf{x} -\rho ||\mathbf{x} ||\mathbf{e}_{1} ||} \begin{bmatrix}x_{1}-\rho ||\mathbf{x} ||\\ x_{2}\\ \vdots \\ x_{n}\end{bmatrix} .\end{gathered}$$

The second equation holds because geometrically the reflection axis $\mathbf{u}$ is just the subtraction $\mathbf{x}-\mathbf{H}\mathbf{x}$. For an algebraical illustration, check out the "I'm Your Zero" section in this [blog](http://drsfenner.org/blog/2016/02/householder-reflections-and-qr/) by M. Fenner[^3].

$\rho \in \mathbb{C}$ is arbitrarily chosen and has absolute value 1. If $x\_1=\|x\_1\|e^{j\theta}$, then we set $\rho=-e^{j\theta}$ to avoid numerical cancellation.

To simplify our problem, we only consider real matrices. Then we can just take $\rho=-sign(x_1)$ to avoid cancellation.

### Householder Reduction to Upper Bidiagonal Form
Eventually, we would like our upper bidiagonal matrix $\mathbf{B}$ to be:

$$\mathbf{B} =\begin{bmatrix}a_{1}&b_{1}&&&\\ &a_{2}&b_{2}&&\\ &&\ddots &\ddots &\\ &&&a_{n-1}&b_{n}\\ &&&&a_{n}\end{bmatrix} .$$

Recall that in the QR algorithm with Householder reduction to hessenberg form, we eliminate all elements below diagonal to be zero column by column. To construct an upper bidiagonal matrix, we need to eliminate the elements above the superdiagonal as well. Such a Householder reflection could be done via a right multiplication. To restate the process clearly, we need to:

1. Perform a left multiplication by a constructed Householder reflector $\mathbf{Q_k}$, s.t. all elements below the diagonal element of column $k$ are eliminated.
2. Perform a right multiplication by another Householder reflector $\mathbf{P_k}$, s.t. all elements after the superdiagonal element of row $k$ are eliminated.

Notice that instead of performing the right multiplication in step 2, we could also transpose the source matrix and perform a normal left multiplication. This simplifies the actual implementation.

We perform the two steps for each row and column of $\mathbf{A}$ to transform it into $\mathbf{B}$. Specifically, we follow the routine[^4] below:

<div markdown="1" class="bordered-block">
**Householder Reduction to Upper Bidiagonal Form**

Input: $\mathbf{A}$ of dimension $m \times n$.
Output: $\mathbf{B}$, $\mathbf{U}$, $\mathbf{V}$ s.t. $\mathbf{A}=\mathbf{U}\mathbf{B}\mathbf{V}^T$.

1. $\mathbf{B} \leftarrow \mathbf{A}$.
2. $\mathbf{U} = \mathbf{I}_{m \times n}$.
3. $\mathbf{V} = \mathbf{I}_{n \times n}$.
4. For $k=1, \cdots, n$ :
	1. Construct Householder reflector $\mathbf{Q}_k$ s.t.
		- Column components $1, \cdots, k-1$ are unaltered from left multiplication by $\mathbf{Q}_k$.
		- $$\mathbf{Q}_{k} \begin{bmatrix} 0\\ \vdots \\ 0\\ b_{k-1,k}\\ b_{k,k}\\ b_{k+1,k}\\ \vdots \\ b_{m,k}\end{bmatrix} =\begin{bmatrix}0\\ \vdots \\ 0\\ b_{k-1,k}\\ s\\ 0\\ \vdots \\ 0 \end{bmatrix} ,\  s=\pm \sqrt{\sum^{m}_{i=k} b^{2}_{i,k}} .$$
	2. $\mathbf{B} \leftarrow \mathbf{Q}_k\mathbf{B}$.
	3. $\mathbf{U} \leftarrow \mathbf{U}\mathbf{Q}_k$.
	4. If $k \leq n-2$, construct Householder reflector $\mathbf{P}_{k+1}$ s.t.
		- Row components $1, \cdots, k$ are unaltered from right multiplication by $\mathbf{P}_{k+1}$.
		- $$\begin{gathered}\begin{bmatrix}0&\cdots &0&b_{k,k}&b_{k,k+1}&b_{k,k+2}&\cdots &b_{k,n}\end{bmatrix} \mathbf{P}_{k+1} \\ =\begin{bmatrix}0&\cdots &0&b_{k,k}&s&0&\cdots &0\end{bmatrix} ,\\ s=\pm \sqrt{\sum^{n}_{j=k+1} b^{2}_{k,j}} .\end{gathered}$$
	5. $\mathbf{B} \leftarrow \mathbf{B}\mathbf{P}_{k+1}$.
	6. $\mathbf{V} \leftarrow \mathbf{P}_{k+1}\mathbf{V}$.
</div><br>

In both reflectors $$\mathbf{Q}_k$$ and $$\mathbf{P}_{k+1}$$, $s$ is derived to preserve the norm of the column component after reflection.

Normally we don't need to derive $\mathbf{U}$ and $\mathbf{V}$ explicitly. Thus, considering only the left and right multiplications:

1. The left multiplication costs:<br>
	$\sum^{n}_{k=1} 4\left( m-k+1\right)  \left( n-k\right)  = \frac{2}{3} \left( n-1\right)  n\left( 3m-n+2\right) \approx n^{2}\left( 2m-\frac{2}{3} n\right)$ flops.
2. The right multiplication costs:<br>
	$\sum^{n-2}_{k=1} 4\left( n-k\right)  \left( m-k\right)  \approx n^{2}\left( 2m-\frac{2}{3} n\right)$ flops.

Therefore, we should expect the reduction algorithm to take $4mn^2 - \frac{4}{3}n^3$ flops. Note that this is the Golub-Kahan reduction. Other alternatives exist, such as Lawson-Hanson-Chan reduction, which costs $2mn^2+2n^3$ flops and is more efficient if $m > \frac{5}{3}n$ [^6].

Essentially, the Lawson-Hanson-Chan reduction performs a QR decomposition on $\mathbf{A}$ first, and then compute the SVD of $\mathbf{R}$ instead by first reducing it to a bidiagonal matrix $\mathbf{B}$ via the Golub-Kahan reduction:

$$\mathbf{A}=\mathbf{Q}\mathbf{R}=\mathbf{Q}\mathbf{U}\mathbf{B}\mathbf{V}^T$$

Check out [this survey](https://www.sciencedirect.com/science/article/pii/0898122187900514) for more details.

## Implicit Symmetric QR Algorithms
With the bidiagonal matrix readily available from $\mathbf{A}$. We could consider our next step. As stated earlier, now the major goal is to **compute eigenvalues of $\mathbf{A}^T\mathbf{A}$ without actually computing $\mathbf{A}^T\mathbf{A}$ or $\mathbf{B}^T\mathbf{B}$, through a midway manipulation of $\mathbf{B}$**.

### Golub-Kahan SVD
Instead of computing $\mathbf{B}^T\mathbf{B}$, consider the augmented matrix:

$$\tilde{\mathbf{A} } =\begin{bmatrix}0&\mathbf{A} \\ \mathbf{A}^{T} &0\end{bmatrix} .$$

$\tilde{\mathbf{A} }$ has eigenvalues $\lambda_k = \pm \sigma_k$ and $m-n$ zeros. We notice immediately that $\tilde{\mathbf{A} }$ can be represented by its bidiagonal form as:

$$\tilde{\mathbf{A} } =\begin{bmatrix}\mathbf{U} &0\\ 0&\mathbf{V} \end{bmatrix} \begin{bmatrix}0&\begin{bmatrix}\mathbf{B} \\ 0\end{bmatrix} \\ \begin{bmatrix}\mathbf{B}^{T} &0\end{bmatrix} &0\end{bmatrix} \begin{bmatrix}\mathbf{U}^{T} &0\\ 0&\mathbf{V}^{T} \end{bmatrix} .$$

Notice that the bidiagonal form $\mathbf{B}$ here is of dimension $n \times n$ rather than $m \times n$. This is because we assume $m \geq n$ for $\mathbf{A}$. By separating out the nonzero $\mathbf{B}$, we avoid the computation of zero eigenvalues.

This is just a similarity transform, which means we could simplify:

$$\bar{\mathbf{A} } =\begin{bmatrix}0&\mathbf{B} \\ \mathbf{B}^{T} &0\end{bmatrix} ,$$

s.t. the original eigenvalues are still preserved as $\lambda_k(\bar{\mathbf{A}}) = \pm \sigma_k$.

Next, we adjust the signs in $\mathbf{B}$ to make sure they are non-negative. This gives us the following representation:

$$\mathbf{B} =\begin{bmatrix}a_{1}&b_{1}&&\\ &\ddots &\ddots &\\ &&a_{n-1}&b_{n-1}\\ &&&a_{n}\end{bmatrix} ,\  a_{k}\geq 0,\  b_{k}\geq 0.$$

Finally, we could perform a matrix permutation to obtain the **symmetric tridiagonal form** desired. Consider the following permutator $\mathbf{P}$ :

$$\mathbf{P} \begin{bmatrix}1\\ 2\\ 3\\ 4\\ \vdots \\ 2n-1\\ 2n\end{bmatrix} =\begin{bmatrix}n+1\\ 1\\ n+2\\ 2\\ \vdots \\ n+n\\ 1\end{bmatrix} .$$

$\mathbf{P}$ interleaves $a_k$ and $b_k$ on each column with zeros, starting from top to bottom. If we perform such a similarity transform by $\mathbf{P}$ on $\mathbf{\bar{\mathbf{A}}}$, we can obtain:

$$\mathbf{S} = \mathbf{P} \bar{\mathbf{A} } \mathbf{P}^{T} =\begin{bmatrix}0&a_{1}&&&&&\\ a_{1}&0&b_{1}&&&&\\ &b_{1}&0&\ddots &&&\\ &&\ddots &\ddots &a_{n-1}&&\\ &&&a_{n-1}&0&b_{n-1}&\\ &&&&b_{n-1}&0&a_{n}\\ &&&&&a_{n}&0\end{bmatrix} .$$

By computing the positive eigenvalues of $\mathbf{S}$, we could then obtain SVD of the original matrix $\mathbf{A}$.

Multiple solvers can be used to iteratively compute the eigenvalues of $\mathbf{S}$. The Golub-Kahan SVD gives its own iteration step. For now, we postpone revealing the actual algorithm until the discussion of Golub-Reinsch SVD as the two share common steps for bidiagonal splitting.

### Golub-Reinsch SVD
Golub-Reinsch SVD can be viewed as a further development of the Golub-Kahan algorithm. It's numerically stable, and converges faster than Golub-Kahan because the former employs Wilkinson's bisection method to solve the augmented symmetric bidiagonal matrix, which requires much computation.

The **key ideas of Golub-Reinsch** are that we can:

1. Apply the QR algorithm with implicit shift on $\mathbf{B}^T\mathbf{B}$.
2. Just consider $\mathbf{B}$ for each QR step in this process instead of $\mathbf{B}^T\mathbf{B}$.

Consider again the reduced bidiagonal matrix $\mathbf{B}$ and $\mathbf{B}^T\mathbf{B}$ :

$$\mathbf{B} =\begin{bmatrix}a_{1}&b_{1}&&&\\ &a_{2}&b_{2}&&\\ &&\ddots &\ddots &\\ &&&a_{n-1}&b_{n}\\ &&&&a_{n}\end{bmatrix} ,$$

$$\mathbf{T} = \mathbf{B}^{T} \mathbf{B} =\begin{bmatrix}a^{2}_{1}&a_{1}b_{2}&&&\\ a_{1}b_{2}&a^{2}_{2}&a_{2}b_{3}&&\\ &a_{2}b_{3}&\ddots &\ddots &\\ &&\ddots &a^{2}_{n-1}&a_{n-1}b_{n}\\ &&&a_{n-1}b_{n}&a^{2}_{n}\end{bmatrix} .$$

We could apply the QR algorithm with implicit shift to $\mathbf{T}$, using the Wilkinson's shift $\sigma$. Recall that a Wilkinson's shift is the eigenvalue of the bottom-right $2 \times 2$ minor matrix of $\mathbf{T}$ closer to $\mathbf{T}_{n,n}$.

The first QR transformation by Givens rotation $\mathbf{G}_1$ can then be derived as:

$$\begin{bmatrix}c&s\\ -s&c\end{bmatrix}^{T} \begin{bmatrix}a^{2}_{1}-\sigma \\ a_{1}b_{2}\end{bmatrix} =\begin{bmatrix}\sqrt{\left( a^{2}_{1}-\sigma \right)^{2}  +a^{2}_{1}b^{2}_{2}} \\ 0\end{bmatrix}.$$

Applying $\mathbf{G}_1$ as a similarity transform to $\mathbf{T}$ gives us:

$$\mathbf{G}^{T}_{1} \mathbf{B}^{T} \mathbf{B} \mathbf{G}_{1} =\begin{bmatrix}+&+&\textcolor{red}{+} &&\\ +&+&+&&\\ \textcolor{red}{+} &+&+&+&\\ &&+&+&\ddots \\ &&&\ddots &\ddots \end{bmatrix} .$$

Now we have a "bulge" at the red marks. Subsequent Givens rotations will continue to **chase these bulges until they are out of the matrix and the tridiagonal form is restored**.

**Here comes the key idea from Reinsch: how about we just work with $\mathbf{B}$?** By this formulation, we essentially only need to "chase away the bulge" in an upper bidiagonal matrix with a series of **left and right** Givens rotations:

$$\begin{gathered}\mathbf{B} \mathbf{G}_{1} =\begin{bmatrix}+&+&&&\\ \textcolor{red}{+} &+&+&&\\ &&+&+&\\ &&&+&\ddots \\ &&&&\ddots \end{bmatrix} ,\\ \\ \mathbf{P}^{T}_{1} \mathbf{B} \mathbf{G}_{1} =\begin{bmatrix}+&+&\textcolor{red}{+} &&\\ &+&+&&\\ &&+&+&\\ &&&+&\ddots \\ &&&&\ddots \end{bmatrix} , \\ \\ \mathbf{P}^{T}_{2} \mathbf{P}^{T}_{1} \mathbf{B} \mathbf{G}_{1} \mathbf{G}_{2} =\begin{bmatrix}+&+&&&\\ &+&+&&\\ &\textcolor{red}{+} &+&+&\\ &&&+&\ddots \\ &&&&\ddots \end{bmatrix} ,\\ \\  \vdots \\ \\ \tilde{\mathbf{B}} = \mathbf{P}^{T}_{n-1} \cdots \mathbf{P}^{T}_{1} \mathbf{B} \mathbf{G}_{1} \cdots \mathbf{G}_{n-1} =\begin{bmatrix}+&+&&&\\ &+&+&&\\ &&+&\ddots &\\ &&&\ddots &+\\ &&&&+\end{bmatrix} .\end{gathered}$$

The resultant matrix $\tilde{\mathbf{B}}$ completes one iteration step of the implicit QR algorithm. Therefore, we just need to run the "chasing bulge" steps iteratively until convergence.

Since $\tilde{\mathbf{B}}$ is just a series of similarity transforms after $\mathbf{B}$, and $\mathbf{B}$ a series of similarity transforms after $\mathbf{A}$, they have the same eigenvalues. Iteratively, **the singular values will lie on the diagonal of the converged $\mathbf{B}$, and the superdiagonal elements of $\tilde{\mathbf{B}}$ will be near zero**.

#### Splitting
In the bidiagonal reduction step of implicit QR algorithms, we could encounter $b_i=0$ in the superdiagonal of $\mathbf{B}$. In this case, $\mathbf{B}$ essentially splits into two bidiagonal matrices:

$$\mathbf{B} =\begin{bmatrix}\mathbf{B}_{1} &\\ &\mathbf{B}_{2} \end{bmatrix} .$$

A nice property from this splitting is that we can **compute the SVDs independently of the split matrices** (parallelization!). The SVD of $\mathbf{B}$ is just a concatenation of these matrices' SVDs.

#### Cancellation
In the case where $a_i=0$, we would have a zero singular value computed. To continue SVD, we need to get rid of $b_{i+1}$ since this value is now singular.

We accomplish this by a special Givens rotation:

$$\begin{gathered}\begin{bmatrix}c&-s\\ s&c\end{bmatrix} \begin{bmatrix}b_{i+1}\\ a_{i+1}\end{bmatrix} =\begin{bmatrix}0\\ \sqrt{a^{2}_{i+1}+b^{2}_{i+1}} \end{bmatrix} ,\\ \text{s.t.} \  \mathbf{G}^{T}_{i,i+1} \begin{bmatrix}a_{1}&b_{2}&&&&&\\ &\ddots &\ddots &&&&\\ &&a_{i-1}&b_{i}&&&\\ &&&0&\textcolor{red}{b_{i+1}} &&\\ &&&&\textcolor{red}{a_{i+1}} &\ddots &\\ &&&&&\ddots &b_{n-1}\\ &&&&&&a_{n}\end{bmatrix} = \\ \begin{bmatrix}a_{1}&b_{2}&&&&&\\ &\ddots &\ddots &&&&\\ &&a_{i-1}&b_{i}&&&\\ &&&0&\textcolor{red}{0} &\textcolor{red}{+} &\\ &&&&\textcolor{red}{a^{\ast }_{i+1}} &\ddots &\\ &&&&&\ddots &b_{n-1}\\ &&&&&&a_{n}\end{bmatrix} .\end{gathered}$$

We can then remove the introduced bulge with further Givens rotations $\mathbf{G}_{i,k}, k=i+2, \cdots, n$.

Notice that after this chain of manipulations, we are again left with a splittable matrix. Therefore, the next step would be to continue carrying out implicit QR steps on them separately.

#### Convergence
There are two cases to consider for checking convergence of an implicit QR solver.

First, the conditions $a_i=0$ or $b_i=0$ are not attainable for convergence checks. Therefore, a threshold should be employed to decide when these values are zero. Golub-Reinsch suggests the following check:

$$|a_{i}|,\  |b_{i+1}|\leq \epsilon \  \text{max}_{i} \left( |a_{i}|+|b_{i}|\right)  =\epsilon ||\mathbf{b} ||_{1}.$$

Second, we could encounter a **deflation** case where $b_n$ is negligible. This indicates that $a_n$ is a singular value. Therefore, we should proceed the iteration with a sub-matrix of $n-1 \times n-1$.

### The Golub-Reinsch Routine [^4]
After all the discussions, we can now give the routine of computing SVD with implicit QR algorithm and bidiagonal reduction. Specifically, we provide the routine for the Golub-Reinsch algorithm as it's vastly used in linear algebra softwares:

<div markdown="1" class="bordered-block">
**The Golub-Reinsch Algorithm for SVD Computation**

Input: $\mathbf{A}$ of dimension $m \times n$, $m \geq n$.
Output: The SVD components s.t. $\mathbf{A}=\mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$.

1. Apply the Golub-Kahan reduction to obtain $\mathbf{B}$, $\mathbf{U}$, $\mathbf{V}$ s.t. $\mathbf{A} = \mathbf{U}\mathbf{B}\mathbf{V}^T$. $\mathbf{B}$ is the reduced upper bidiagonal form of $\mathbf{A}$.

2. Repeat:
	1. For any $i=1,\cdots,n-1$:  `%Filters out singular values by thresholding.`<br>
		If $|b_{i,i+1}|\leq \epsilon \left( |b_{i,i}|+|b_{i+1,i+1}|\right)$ : set $b_{i,i+1}=0$.
		
	2. Split $\mathbf{B}$ as:<br>
		
		$$\mathbf{B} = \begin{bmatrix} \mathbf{B}_{1,1} &0&0\\ 0&\mathbf{B}_{2,2} &0\\ 0&0&\mathbf{B}_{3,3} \end{bmatrix} \begin{matrix}p\\ n-p-q\\ q \end{matrix}$$
		
		where:
		- The smallest $p$ and the largest $q$ are retained.
		- $\mathbf{B}\_{3,3}$ is diagonal and $\mathbf{B}\_{2,2}$ has nonzero superdiagonal entries.
		- $\mathbf{B}\_{1,1}$ contains some singular values, $\mathbf{B}\_{2,2}$ contains no singular values and needs to be iterated, $\mathbf{B}\_{3,3}$ contains the derived singular values we want.
		
	3. If $q=n$, set $\mathbf{\Sigma}=diag(\mathbf{B})$, **STOP.**  `%Convergence!`
	
	4. For $i=p+1,\cdots,n-q-1$ :
		
		If $\mathbf{b}_{i,i}=0$:  `%Cancellation of computing bii`
		1. Apply our special Givens rotations to maintain the bidiagonal form of $\mathbf{B}_{2,2}$.
		
		Else:  `%Golub-Kahan SVD Step`
		
		`%First, apply Wilkinson shift.`
		1. Set $\mathbf{C}$ as bottom-right $2 \times 2$ minor of $\mathbf{B}^{T}\_{2,2} \mathbf{B}\_{2,2}$.
		2. Obtain eigenvalues $\lambda_1, \lambda_2$ of $\mathbf{C}$. Set $\mu$ as the $\lambda$ closer to $c_{2,2}$.
		3. $k=p+1$, $\alpha=b^{2}\_{k,k}-\mu$, $\beta =b\_{k,k}b\_{k,k+1}$.
		
		`%Sequential Givens rotations to remove bulge.`
		4. For $k=p+1,\cdots,n-q-1$ :
			1. Construct the right Givens rotation $\mathbf{G}_r$ s.t.
				
				$$\begin{bmatrix}\alpha &\beta \end{bmatrix} \begin{bmatrix}c&-s\\ s&c\end{bmatrix}^{T} =\begin{bmatrix}\sqrt{\alpha^{2} +\beta^{2} } &0\end{bmatrix}.$$
				
			2. $\mathbf{B} \leftarrow \mathbf{B}\mathbf{G}_{r}^{T}$.
			3. $\mathbf{V} \leftarrow \mathbf{V}\mathbf{G}_{r}^{T}$.  `%Update right singular vectors.`
			4. $\alpha=b_{k,k}$, $\beta=b_{k+1,k}$.
			5. Construct the left Givens rotation $\mathbf{G}_l$ s.t.
				
				$$\begin{bmatrix}c&-s\\ s&c\end{bmatrix} \begin{bmatrix}\alpha \\ \beta \end{bmatrix} =\begin{bmatrix}\sqrt{\alpha^{2} +\beta^{2} } \\ 0\end{bmatrix}.$$
				
			6. $\mathbf{B} \leftarrow \mathbf{G}_{l}\mathbf{B}$.
			7. $\mathbf{U} \leftarrow \mathbf{G}_{l}\mathbf{U}$.  `%Update left singular vectors.`
			8. If $k \leq n-q-1$ :
				- $\alpha=b_{k,k+1}$.
				- $\beta=b_{k,k+2}$.
</div><br>

You can try implementing it yourself. A good test would be to run the algorithm on a perturbed [Wilkinson matrix](https://www.mathworks.com/help/matlab/ref/wilkinson.html) which has zeroed-out diagonal/superdiagonal entries, against the standard implementation in LAPACK, numpy or matlab.

With this routine devised, we end our discussion of the implicit symmetric QR algorithms.

## Wrap-up
By mastering matrix reduction to its bidiagonal form and the subsequent computation of Singular Value Decomposition through implicit symmetric QR algorithms, we have made significant strides in dismantling the black box of SVD.

Matrix reduction and SVD via implicit symmetric QR algorithms significantly contribute across different fields. In machine learning, they're vital for data security and recommendation engines. They enhance image compression efficiency, paving the way for faster big data processing. In natural language processing, they're used for semantic document retrieval. These tools provide stable solutions in scientific computing, form the base of statistical analyses in social sciences, and even offer stability in quantum computing systems. Despite being long-established, their usage remains constant, underpinning myriad contemporary applications.

There are some implicit references for this post, they are listed in footnotes [^1] [^5].

Thank you for reading this post. Please correct me for any mistakes and abuses of concepts. Otherwise, stay tuned for the subsequent parts!

[^1]: J. Lambers, “CME335: Advanced Topics in Numerical Linear Algebra.” https://web.stanford.edu/class/cme335/spr11/ (accessed Jul. 20, 2023).
[^2]: P. Arbenz, “Solving Large Scale Eigenvalue Problems.” https://people.inf.ethz.ch/~arbenz/ewp/ (accessed Jul. 20, 2023).
[^3]: M. Fenner, “Householder Reflections and QR” Feb. 23, 2016. http://drsfenner.org/blog/2016/02/householder-reflections-and-qr/ (accessed Jul. 20, 2023).
[^4]: A. K. Cline and I. S. Dhillon, "Computation of the Singular Value Decomposition", Handbook of Linear Algebra, CRC Press, pages 45-1--45-13, 2006.
[^5]: W. Gander, “The First Algorithms to Compute the SVD” https://people.inf.ethz.ch/gander/talks/Vortrag2022.pdf (accessed Jul. 21, 2023).
[^6]: G. Fasshauer, “477/577 Handouts and Worksheets.” http://www.math.iit.edu/~fass/477_577_handouts.html (accessed Jul. 21, 2023).
[^7]: SHPC Group, "Notes on the Symmetric QR Algorithm"  https://www.cs.utexas.edu/users/flame/Notes/NotesOnSymQR.pdf (accessed Jul. 22, 2023).
[^8]: T. Huckle, "Parallel Numerics: Lecture 12" https://www5.in.tum.de/lehre/vorlesungen/parnum/WS16/lecture_12.pdf (accessed Jul. 22, 2023).
