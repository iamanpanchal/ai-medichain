import { COPY } from '../content';
import { Button } from './Button';
import { I } from './ui';

export function EmptyRecords({ onUpload }: { onUpload: () => void }) {
  return <section className="panel grid min-h-64 place-items-center p-6 text-center"><div><I n="file" className="mx-auto h-8 w-8 text-dim" /><h2 className="mt-4 font-display text-lg font-bold">{COPY.statuses.noRecords}</h2><Button className="mt-4" onClick={onUpload}>{COPY.actions.upload}</Button></div></section>;
}
export function VerificationError({ onRetry, onDetails }: { onRetry: () => void; onDetails: () => void }) {
  return <section className="panel grid min-h-64 place-items-center p-6 text-center"><div><I n="alert" className="mx-auto h-8 w-8 text-coral" /><h2 className="mt-4 font-display text-lg font-bold">{COPY.statuses.verificationFailed}</h2><p className="mt-2 text-sm text-mist">{COPY.verificationExplanation}</p><div className="mt-4 flex justify-center gap-2"><Button onClick={onRetry}>{COPY.actions.tryAgain}</Button><Button variant="secondary" onClick={onDetails}>{COPY.actions.viewDetails}</Button></div></div></section>;
}
export function TransactionProgress({ current = 1 }: { current?: 0 | 1 | 2 }) {
  const stages = [COPY.statuses.initiating, COPY.statuses.confirming, COPY.statuses.finalizing];
  return <ol aria-label="Blockchain transaction progress" className="panel flex justify-between gap-2 p-5">{stages.map((stage, index) => <li key={stage} className={`flex flex-1 flex-col items-center gap-2 text-center text-xs font-bold ${index <= current ? 'text-mint' : 'text-dim'}`}><span className={`grid h-7 w-7 place-items-center rounded-full ${index <= current ? 'bg-mint/15' : 'bg-deep'}`}>{index + 1}</span>{stage}</li>)}</ol>;
}
