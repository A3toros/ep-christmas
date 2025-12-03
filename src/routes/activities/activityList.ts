import SpeakWithSanta from './SpeakWithSanta'
import BecomeSanta from './BecomeSanta'

export const activities = [
  {
    slug: 'speak-with-santa',
    title: 'Speak with Santa',
    description: 'Tell Santa what you want for Christmas and become his friend elf!',
    component: SpeakWithSanta,
  },
  {
    slug: 'become-santa',
    title: 'Become Santa',
    description: 'Share what Christmas means to you and transform into Santa!',
    component: BecomeSanta,
  },
] as const

export type ActivityConfig = (typeof activities)[number]

