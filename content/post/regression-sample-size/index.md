---
title: "Interactive Demo: How Sample Size Shapes Regression Results"
subtitle: "Move a slider and watch p-values, standard errors, and statistical significance change in real time."

summary: >
  An interactive teaching tool showing how sample size affects OLS regression output—
  coefficients, standard errors, t-statistics, and p-values—using a hypothetical study
  of left–right political self-placement and trust in news media.

date: '2024-03-07T00:00:00Z'
lastmod: '2024-03-07T00:00:00Z'
draft: false
featured: false

tags:
  - methods
  - regression
  - statistics
  - teaching

categories:
  - Teaching

authors:
  - admin
---

The app below lets you explore how the **same underlying population relationship** looks at different sample sizes. The hypothetical study examines whether left–right political self-placement (0–10) predicts trust in news media (1–5).

Drag the slider from *n* = 10 to *n* = 1 000 and watch:

- the scatter plot fill in,
- the regression line stabilise around the true slope (β = −0.15),
- the standard error shrink,
- the p-value fall—often below conventional thresholds only once the sample is large enough.

{{< rawhtml >}}
<div style="border:1px solid #dee2e6; border-radius:8px; overflow:hidden; margin: 1.5rem 0;">
  <iframe
    src="/apps/regression-sample-size/"
    width="100%"
    height="960"
    frameborder="0"
    scrolling="no"
    title="Regression sample size demo">
  </iframe>
</div>
{{< /rawhtml >}}

### Key take-aways

1. **Standard error ∝ 1/√n** — doubling the sample roughly halves the standard error.
2. **The effect size (slope) doesn't change** with sample size; only our ability to detect it does.
3. **Statistical significance ≠ practical importance** — with *n* = 1 000 even a trivial slope will be significant.
4. **Non-significance ≠ no effect** — with *n* = 20 the true −0.15 slope is nearly impossible to detect reliably.

Hit **"Draw new random sample"** to see how results vary across different datasets drawn from the same population—a nice illustration of sampling variability.
