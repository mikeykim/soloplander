import { solopreneursData } from '@/data/solopreneurs'
import type { RegionType, ISolopreneur } from '@/types'

export function getSolopreneursByRegion(region: RegionType): ISolopreneur[] {
  return solopreneursData.filter(solopreneur => solopreneur.region === region)
} 