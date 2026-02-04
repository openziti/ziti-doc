import React, { useState, useEffect } from 'react';
import styles from './ZitiEnd2End.module.css';

interface SequenceStep {
  id: number;
  from: string;
  to: string;
  message: string;
  note?: string;
  isDashed?: boolean;
  phase?: 'bind' | 'connect';
}

const ZitiEnd2End = () => {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const participants = ['Alice', 'Bob', 'EdgeRouter', 'Controller'];

  const steps: SequenceStep[] = [
    // Phase 1: Bob binds the service
    { id: 0, from: 'Bob', to: 'Bob', message: '[Bob binds the service]', note: '[Bob binds the service]', phase: 'bind' },
    { id: 1, from: 'Bob', to: 'Bob', message: 'Bob generates ephemeral key pair: P(Bob)/S(Bob)', phase: 'bind' },
    { id: 2, from: 'Bob', to: 'EdgeRouter', message: '1. Bind(service, P(Bob))', phase: 'bind' },
    { id: 3, from: 'EdgeRouter', to: 'Controller', message: '2. Bind(Bob.service, P(Bob))', phase: 'bind' },
    { id: 4, from: 'Controller', to: 'Controller', message: 'Bob is registered to host service', phase: 'bind' },
    
    // Phase 2: Alice connects
    { id: 5, from: 'Alice', to: 'Alice', message: '[Alice connects to service hosted by Bob]', note: '[Alice connects to service hosted by Bob]', phase: 'connect' },
    { id: 6, from: 'Alice', to: 'Alice', message: 'Alice generates ephemeral key pair: P(Alice)/S(Alice)', phase: 'connect' },
    { id: 7, from: 'Alice', to: 'Controller', message: '3. GetSession(service)', phase: 'connect' },
    { id: 7, from: 'Alice', to: 'Controller', message: '3. GetSession(service)', phase: 'connect' },
    { id: 8, from: 'Controller', to: 'Alice', message: '4. Session(tok, EdgeRouter)', phase: 'connect' },
    { id: 9, from: 'Alice', to: 'EdgeRouter', message: '5. Dial(tok, P(Alice))', phase: 'connect' },
    { id: 10, from: 'EdgeRouter', to: 'Controller', message: '6. CreateSession(service, P(Alice))', phase: 'connect' },
    { id: 11, from: 'Controller', to: 'Controller', message: 'Magic of routing', phase: 'connect' },
    { id: 12, from: 'Controller', to: 'EdgeRouter', message: '7. Session(Route, P(Bob))', phase: 'connect' },
    { id: 13, from: 'EdgeRouter', to: 'Alice', message: '8. DialSuccess(P(Bob))', phase: 'connect' },
    { id: 14, from: 'Controller', to: 'EdgeRouter', message: '9. Egress(service, P(Alice))', isDashed: true, phase: 'connect' },
    { id: 15, from: 'EdgeRouter', to: 'Bob', message: '10. Dial(P(Alice))', phase: 'connect' },
  ];

  const speedDelays = {
    slow: 2000,
    normal: 1200,
    fast: 600,
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (activeStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(activeStep + 1);
      }, speedDelays[speed]);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, activeStep, speed]);

  const handlePlay = () => {
    if (activeStep === steps.length - 1) {
      setActiveStep(-1);
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(-1);
  };

  const getParticipantIndex = (name: string) => participants.indexOf(name);

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          {!isPlaying ? (
            <button className={styles.playButton} onClick={handlePlay}>
              ▶️ {activeStep === steps.length - 1 ? 'Replay' : 'Play'}
            </button>
          ) : (
            <button className={styles.pauseButton} onClick={handlePause}>
              ⏸️ Pause
            </button>
          )}
          <button className={styles.resetButton} onClick={handleReset}>
            🔄 Reset
          </button>
        </div>

        <div className={styles.controlGroup}>
          <select 
            className={styles.speedSelect} 
            value={speed} 
            onChange={(e) => setSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      <div className={styles.progressText}>
        Step {activeStep >= 0 ? activeStep + 1 : 0} of {steps.length}
      </div>

      {/* Diagram Area with Lifelines */}
      <div className={styles.diagramArea}>
        {/* Participants Header */}
        <div className={styles.participantsHeader}>
          {participants.map((name) => (
            <div key={name} className={styles.participantColumn}>
              <div className={`${styles.participantIcon} ${styles[`participant${name}`]}`}>
                {name === 'Alice' && '👤'}
                {name === 'Bob' && '💼'}
                {name === 'EdgeRouter' && '🔀'}
                {name === 'Controller' && '🎛️'}
              </div>
              <div className={styles.participantName}>{name}</div>
            </div>
          ))}
        </div>

        {/* Lifelines - vertical lines under each participant */}
        <div className={styles.lifelinesContainer}>
          {participants.map((name, idx) => (
            <div
              key={name}
              className={styles.lifeline}
              style={{ left: `${idx * 25 + 12.5}%` }}
            />
          ))}
        </div>

        {/* Messages overlaid on lifelines */}
        <div className={styles.messagesContainer}>
          {steps.map((step, idx) => {
            const isActive = activeStep >= idx;
            const isCurrent = activeStep === idx;
            const fromIdx = getParticipantIndex(step.from);
            const toIdx = getParticipantIndex(step.to);
            const isSelfMessage = step.from === step.to;

            return (
              <div
                key={step.id}
                className={`${styles.messageRow} ${isActive ? styles.messageActive : ''} ${isCurrent ? styles.messageCurrent : ''}`}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep(idx);
                }}
              >
                <div className={styles.messageHeader}>
                  {/* Phase separator */}
                  {(idx === 0 || idx === 5) && (
                    <div className={`${styles.phaseSeparator} ${step.phase === 'bind' ? styles.phaseBind : styles.phaseConnect}`}>
                      <span className={styles.phaseTitle}>
                        {step.phase === 'bind' ? '🔐 Phase 1: Service Binding' : '🔗 Phase 2: Connection Establishment'}
                      </span>
                      {step.note && (
                        <>
                          <span className={styles.phaseDivider}>•</span>
                          <span className={styles.phaseNote}>{step.note}</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Standalone note (if no phase separator) */}
                  {step.note && idx !== 0 && idx !== 5 && (
                    <div className={styles.noteBox}>{step.note}</div>
                  )}
                </div>

                {/* Arrow visualization */}
                <div className={styles.messageViz}>
                  {isSelfMessage ? (
                    // Self message - loop arrow
                    <div 
                      className={styles.selfArrow}
                      style={{ left: `${fromIdx * 25 + 12.5}%` }}
                    >
                      <div className={`${styles.selfArrowLine} ${step.phase === 'bind' ? styles.arrowBind : styles.arrowConnect}`}>
                        <span className={styles.selfArrowSymbol}>↻</span>
                      </div>
                    </div>
                  ) : (
                    // Regular message arrow
                    <div
                      className={`${styles.arrow} ${step.phase === 'bind' ? styles.arrowBind : styles.arrowConnect} ${step.isDashed ? styles.arrowDashed : ''}`}
                      style={{
                        left: `${Math.min(fromIdx, toIdx) * 25 + 12.5}%`,
                        width: `${Math.abs(toIdx - fromIdx) * 25}%`,
                      }}
                    >
                      <div className={styles.arrowLine}>
                        <div 
                          className={styles.arrowHead}
                          style={{
                            left: fromIdx < toIdx ? '100%' : '0%',
                            transform: fromIdx < toIdx ? 'translateX(-6px)' : 'translateX(6px) scaleX(-1)'
                          }}
                        >▶</div>
                      </div>
                    </div>
                  )}

                  {/* Message label */}
                  <div 
                    className={styles.messageLabel}
                    style={{
                      left: isSelfMessage 
                        ? `${fromIdx * 25 + 25}%`
                        : `${(Math.min(fromIdx, toIdx) + Math.abs(toIdx - fromIdx) / 2) * 25 + 12.5}%`
                    }}
                  >
                    <div className={styles.messageBadges}>
                      <span className={`${styles.badge} ${styles[`badge${step.from}`]}`}>{step.from}</span>
                      {!isSelfMessage && (
                        <>
                          <span className={styles.arrowSymbol}>→</span>
                          <span className={`${styles.badge} ${styles[`badge${step.to}`]}`}>{step.to}</span>
                        </>
                      )}
                    </div>
                    <div className={styles.messageText}>{step.message}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendTitle}>Key:</span>
        <span className={styles.legendItem}>🔑 P(x) = Public Key</span>
        <span className={styles.legendItem}>🔐 S(x) = Secret Key</span>
        <span className={styles.legendItem}>🎫 tok = Session Token</span>
      </div>
    </div>
  );
};

export default ZitiEnd2End;
