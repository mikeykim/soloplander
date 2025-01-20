import styles from './RegionDescription.module.css'

interface Props {
  title: string
  description: string
}

export default function RegionDescription({ title, description }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )
} 