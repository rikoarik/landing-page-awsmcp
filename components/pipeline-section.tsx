'use client';

import Image from 'next/image';
import type { Copy } from '@/lib/content';

/**
 * The SolidCraft → web pipeline, told as four real steps with the actual numbers from
 * the model that ships with this page. The FigCraft column is deliberately explicit
 * about what arrives there: a PNG image layer, not an editable 3D scene.
 */
export function PipelineSection({ t }: { t: Copy }) {
  return (
    <section id="pipeline" className="pipeline section" aria-labelledby="pipeline-heading">
      <div className="wrap">
        <div className="pipeline-head">
          <span className="micro-label">{t.pipelineLabel}</span>
          <h2 id="pipeline-heading" className="line-breaks">{t.pipelineTitle}</h2>
          <p className="section-intro">{t.pipelineIntro}</p>
        </div>

        <ol className="pipeline-steps">
          {t.pipelineSteps.map((step, index) => (
            <li key={step} data-step={index}>
              <span className="step-index">0{index + 1}</span>
              <h3>{step}</h3>
              <p>{t.pipelineBodies[index]}</p>
            </li>
          ))}
        </ol>

        <div className="pipeline-artifacts">
          <figure className="artifact artifact-solidcraft">
            <Image
              src="/assets/3d/awsm-router/detail-dial.webp"
              alt={t.pipelineSteps[0]}
              width={1200}
              height={1119}
              sizes="(max-width: 900px) 90vw, 30vw"
            />
            <figcaption>
              <span className="micro-label">SOLIDCRAFT</span>
              <p>{t.pipelineSteps[0]} — awsm-router.sc</p>
            </figcaption>
          </figure>

          <div className="artifact-flow" aria-hidden="true">
            <span>OBJ</span>
            <i />
            <span>GLB</span>
            <i />
            <span>WEB</span>
          </div>

          <figure className="artifact artifact-figcraft">
            <Image
              src="/assets/3d/figcraft-board.webp"
              alt={t.pipelineSteps[2]}
              width={900}
              height={900}
              sizes="(max-width: 900px) 90vw, 30vw"
            />
            <figcaption>
              <span className="micro-label">FIGCRAFT</span>
              <p>{t.figcraft3d}</p>
            </figcaption>
          </figure>
        </div>

        <div className="pipeline-numbers">
          <h3>{t.pipelineNumbersTitle}</h3>
          <dl>
            {t.pipelineNumbers.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pipeline-caveat">
          <span className="micro-label">LIMIT</span>
          <p>{t.pipelineCaveat}</p>
        </div>
      </div>
    </section>
  );
}
