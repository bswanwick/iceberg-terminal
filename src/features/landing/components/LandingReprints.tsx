import { Button, Card, CardContent, Paper, Stack, Typography } from '@mui/material'

type PrintItem = {
  title: string
  edition: string
  detail: string
  price: string
}

const PRINT_ITEMS: PrintItem[] = [
  {
    title: 'Harbor Departure Broadside Reprint',
    edition: 'Museum matte, 18 x 24 in',
    detail:
      'Scanned from an original quay announcement with hand-cleaned artifacts and tonal balancing.',
    price: '$48',
  },
  {
    title: 'Cabin Deck Plan Lithograph Reprint',
    edition: 'Archival cotton rag, 24 x 36 in',
    detail:
      'Reproduced from a private collection sheet with preserved fold marks and authentic margin notes.',
    price: '$74',
  },
  {
    title: 'Travel Bureau Poster Study Reprint',
    edition: 'Gallery stock, 12 x 18 in',
    detail:
      'High-resolution capture of a prewar bureau poster, color-corrected against period references.',
    price: '$38',
  },
]

function LandingReprints() {
  return (
    <Paper
      id="reprints"
      elevation={0}
      sx={{
        scrollMarginTop: { xs: 180, sm: 168, md: 136 },
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: '1px solid rgba(17, 33, 48, 0.16)',
        background:
          'linear-gradient(120deg, rgba(227, 234, 236, 0.95) 0%, rgba(209, 218, 223, 0.95) 100%)',
      }}
    >
      <Stack spacing={3}>
        <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
          Looking for something new?
        </Typography>
        <Typography variant="h3">Faithfully reproduced prints</Typography>
        <Typography variant="body1" sx={{ maxWidth: 780 }}>
          We sell new paper too! Our in-house line uses antique letterpress printing blocks and
          traditional printing methods to create high-quality, display ready, prints. We use only
          high-quality cotton rag paper. We hand-roll the ink and hand-press the paper ourselves. We
          also offer print-on-demand home decor and other items made from high-DPI scans that we
          personally sourced, captured, cropped, corrected, and digitized ourselves. All of our
          reprint items are <b>made in the USA</b>.
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {PRINT_ITEMS.map((item) => (
            <Card key={item.title} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="h5">{item.title}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.edition}
                </Typography>
                <Typography variant="body2" sx={{ minHeight: 78 }}>
                  {item.detail}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{item.price}</Typography>
                  <Button variant="text" color="primary">
                    Reserve Print
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}

export default LandingReprints
