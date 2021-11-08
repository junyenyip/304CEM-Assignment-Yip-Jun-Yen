import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import axios from 'axios';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  constructor(private firestore: AngularFirestore) { }
  dataSource!: MatTableDataSource<any>;

  items = [] as any;

  city = new FormControl('');
  
  ngOnInit(): void {
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
  }

  // onUpdate(): void{
  //   this.city.get('city')?.value;
  //   console.log(this.city.value);
  //   this.firestore.collection("dataEntry").doc(this.items[0].id).update({
  //     "0.cityName": this.city.value
  //   });
  // }
  onUpdate(): void{
    const apiWeather = '0b14fe91eb0548e67cc8956d170f24cc';
    const apiNews = '661e6cc4402e4f98852097be992e11b6';

    this.city.get('city')?.value;
    console.log(this.city.value);
    
    this.firestore.collection("dataEntry").doc(this.items[0].id).update({
      "0.cityName": this.city.value
    });

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
      this.firestore.collection("dataEntry").doc(this.items[0].id).update(obj);
    })).catch(error=>{
      alert("Please enter a valid area");
    });;
  }

}
