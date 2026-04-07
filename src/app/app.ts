import { Component, inject, OnInit, HostListener } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NgxDocViewerModule, viewerType } from 'ngx-doc-viewer';

interface DocRecord {
  id: string;
  title: string;
  file_type: string;
  created_at: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DatePipe,
    NzTableModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzTagModule,
    NzLayoutModule,
    NgxDocViewerModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {

  @HostListener('document:keydown', ['$event'])
  blockKeys(e: KeyboardEvent) {
    if (e.ctrlKey && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }

  private http = inject(HttpClient);

  docs: DocRecord[] = [];
  tableLoading = true;

  modalTitle = '';
  modalLoading = false;
  docUrl = '';
  docType = '';
  docViewer: viewerType = 'google';

  ngOnInit() {
    this.http.get<DocRecord[]>('http://localhost:3000/api/documents').subscribe({
      next: (data) => { this.docs = data; this.tableLoading = false; },
      error: () => { this.tableLoading = false; },
    });
  }

  openPreview(doc: DocRecord) {
    this.modalTitle = doc.title;
    this.modalLoading = true;
    this.docUrl = '';

    this.http.get<{ type: string; title: string; url: string }>(
      `http://localhost:3000/api/preview/${doc.id}`
    ).subscribe({
      next: (meta) => {
        this.docType = meta.type;
        this.docViewer = meta.type === 'image' ? 'url'
          : ['excel', 'xlsx', 'xls'].includes(meta.type) ? 'office'
          : 'google';
        this.docUrl = meta.url;
        this.modalLoading = false;
      },
      error: () => { this.modalLoading = false; },
    });
  }

  closeModal() {
    this.docUrl = '';
    this.docType = '';
  }

  tagColor(type: string): string {
    const map: Record<string, string> = {
      pdf: 'red', doc: 'blue', docx: 'blue',
      xls: 'green', xlsx: 'green', excel: 'green',
      ppt: 'orange', pptx: 'orange', image: 'purple',
    };
    return map[type?.toLowerCase()] ?? 'default';
  }
}
