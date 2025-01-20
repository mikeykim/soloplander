import { solopreneursData } from '@/data/solopreneurs'
import type { ISolopreneur, RegionType } from '@/types'

export const getSolopreneursByRegion = (region: RegionType): ISolopreneur[] => {
  return solopreneursData.filter(solopreneur => solopreneur.region === region)
} 