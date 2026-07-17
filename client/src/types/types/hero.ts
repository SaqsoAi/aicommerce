export interface Hero {
  id: string;
  title: string;
  subtitle?: string;

  image?: string;
  video?: string;

  type: string;
  active: boolean;

  buttonText?: string;
  buttonLink?: string;

  secondaryText?: string;
  secondaryLink?: string;

  startDate?: string;
  endDate?: string;
}