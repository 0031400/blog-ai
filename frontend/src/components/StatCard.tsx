import { Box, Typography } from '@mui/material'

type StatCardProps = {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Box className="rounded-2xl border border-stone-300/70 bg-stone-50/70 px-4 py-3">
      <Typography className="text-xs uppercase tracking-[0.22em] text-stone-500">{label}</Typography>
      <Typography className="mt-1 text-base font-semibold text-stone-900">{value}</Typography>
    </Box>
  )
}
