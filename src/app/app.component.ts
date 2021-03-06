import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import axios from 'axios';
// import { list } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
// import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private firestore: AngularFirestore, public dialog: MatDialog){}

  displayedColumns = ["0", "1", "2", "3", "4", "5", "6"];
  dataSource!: MatTableDataSource<any>;

  city = new FormControl('');
  title = 'assignmentApi';

  items = [] as any;

  ngOnInit(){
    // this.firestore.collection("dataEntry").valueChanges().subscribe(data => {
    //   this.dataSource = new MatTableDataSource(data);
    //   console.log(data);
    // });

    this.firestore.collection("dataEntry").snapshotChanges().subscribe(data => {
      this.items=[];
      data.forEach(a => {
        let item:any = a.payload.doc.data();
        item.id = a.payload.doc.id;
        this.items.push(item);
        // console.log(item);
        // return item;
        // this.dataSource = new MatTableDataSource(item);
      })
      this.dataSource = new MatTableDataSource(this.items);
    });

    // this.firestore.collection("dataEntry").snapshotChanges().pipe(map(actions=>{
    //   return actions.map(a=>{
    //     const id = a.payload.doc.id;
    //     // const data = a.payload.doc.data();
    //     return id;
    //   })
    // })).subscribe();
  };

  onSubmit(): void{
    const apiWeather = '0b14fe91eb0548e67cc8956d170f24cc';
    const apiNews = '661e6cc4402e4f98852097be992e11b6';

    this.city.get('city')?.value;
    // console.log(this.city.value);

    const queryWeather = `https://api.openweathermap.org/data/2.5/weather?q=${this.city.value}&appid=${apiWeather}`;
    const queryNews = `https://newsapi.org/v2/everything?q=${this.city.value}&from=2021-10-20&sortBy=popularity&apiKey=${apiNews}`;

    axios.all([
      axios.get(queryWeather),
      axios.get(queryNews)
    ]).then(axios.spread((response1, response2)=>{
      const data = [];
      data.push({cityName: response1.data.name, country: response1.data.sys.country, weather:response1.data.weather[0].main, 
        newsTitle: response2.data.articles[0].title, newsDescription: response2.data.articles[0].description});
      // data.push(response1.data.name, response1.data.sys.country, response1.data.weather[0].main, 
      //     response2.data.articles[0].title, response2.data.articles[0].description);
      const obj = Object.assign({}, data);
      // console.log(obj);
      this.firestore.collection("dataEntry").add(obj);
    })).catch(error=>{
      alert("Please enter a valid area");
    });
  }

  openDialog(): void {
    this.dialog.open(DialogComponent);
  }

  onDelete(): void{
    this.firestore.collection("dataEntry").doc(this.items[0].id).delete();
  }
}
