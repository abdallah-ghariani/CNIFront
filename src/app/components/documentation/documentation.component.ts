import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { FormsModule } from "@angular/forms";
import { Documentation } from "../../models/documentation";
import { DocumentationService } from "../../services/documentation.service";

@Component({
  selector: "app-documentation",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    FileUploadModule,
    FormsModule,
  ],
templateUrl: 'documentation.component.html'
})
export class DocumentationComponent implements OnInit {
  documents: Documentation[] = [];
  showDialog = false;
  newDoc = { title: "", description: "" };
  selectedFile?: File;

  constructor(private documentationService: DocumentationService) {}

  ngOnInit(): void {
    this.fetchDocuments();
  }

  fetchDocuments() {
    this.documentationService.getAll().subscribe((data) => {
      this.documents = data;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async upload() {
    if (!this.selectedFile) return;
    this.documentationService
      .upload({ ...this.newDoc }, this.selectedFile)
      .subscribe(() => {
        this.fetchDocuments();
        this.showDialog = false;
        this.newDoc = { title: "", description: "" };
        this.selectedFile = undefined;
      });
  }

  delete(id: string) {
    this.documentationService.delete(id).subscribe(() => {
      this.fetchDocuments();
    });
  }

  download(id: string) {
    this.documentationService.download(id).subscribe((response) => {
      console.log(response);
      var binaryData = [];
      binaryData.push(response);
      var url = window.URL.createObjectURL(new Blob(binaryData, {type: "application/pdf"}));
      var a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.setAttribute('target', 'blank');
      a.href = url;
      a.download =id ;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  
    });
  }
}
