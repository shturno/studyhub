export interface TimerDisplayProps {
  readonly topicId: string;
  readonly topicName: string;
  readonly subjectName: string;
  readonly onComplete?: () => void;
}
