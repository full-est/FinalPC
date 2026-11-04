import { Icon, type IconName } from './Icon'

const ICONS: Record<string, IconName> = {
  cpu: 'cpu', motherboard: 'chip', ram: 'list', gpu: 'gpu', storage: 'save', psu: 'bolt', case: 'box', cooler: 'wrench', build: 'package',
}

/** У товаров нет фотографий — рисуем стильную заглушку по категории. Если image_url есть, показываем его. */
export function ProductImage({ src, category, label, size = 'md' }: {
  src?: string | null; category?: string; label?: string; size?: 'sm' | 'md' | 'lg'
}) {
  if (src) return <div className={`pimg pimg-${size}`}><img src={src} alt={label ?? ''} loading="lazy" /></div>
  const icon = ICONS[category ?? ''] ?? 'box'
  return (
    <div className={`pimg pimg-${size} pimg-${category ?? 'default'}`} role="img" aria-label={label}>
      <div className="pimg-glow" />
      <Icon name={icon} size={size === 'sm' ? 22 : size === 'lg' ? 84 : 52} strokeWidth={1.4} />
    </div>
  )
}
