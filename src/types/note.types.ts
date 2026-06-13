export type InputType =
  | 'TAREFA'
  | 'META'
  | 'RELATORIO_DIARIO'
  | 'OBSERVACAO'
  | 'DESCONHECIDO';

export interface NoteResponse {
  id: string;
  title: string;
  summary: string;
  expandedContent: string;
  extractedItems: string[];
  inferredDeadline: string;
  autoTags: string[];
  nextSteps: string[];
  detectorType: InputType;
  createdAt: string;
}

export interface NoteAddRequest {
  groupId: string;
  title: string;
  summary: string;
  expandedContent: string;
  extractedItems: string[];
  inferredDeadline: string;
  autoTags: string[];
  nextSteps: string[];
  detectorType: InputType;
}

export interface NoteUpdateRequest extends NoteAddRequest {
  noteId: string;
}

export interface IAResponse {
  title: string;
  summary: string;
  expandedContent: string;
  extractedItems: string[];
  inferredDeadline: string;
  autoTags: string[];
  nextSteps: string[];
  detectorType: InputType;
}
