import { Breadcrumbs as MuiBreadcrumbs, Typography, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useRouter } from 'next/router';

export default function Breadcrumbs({ items }: { items: { label: string, href?: string }[] }) {
  const router = useRouter();
  return (
    <MuiBreadcrumbs separator={<NavigateNextIcon sx={{ transform: 'scaleX(-1)' }} />} aria-label="breadcrumb">
      {items.map((item, idx) =>
        item.href ? (
          <Link key={idx} color="inherit" href={item.href} onClick={e => { e.preventDefault(); router.push(item.href!) }}>
            {item.label}
          </Link>
        ) : (
          <Typography key={idx} color="text.primary">{item.label}</Typography>
        )
      )}
    </MuiBreadcrumbs>
  );
}
