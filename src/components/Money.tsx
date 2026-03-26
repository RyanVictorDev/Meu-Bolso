import { formatBRLFromCents } from '../domain/finance'

export default function Money({ amountCents }: { amountCents: number }) {
  return <>{formatBRLFromCents(amountCents)}</>
}

