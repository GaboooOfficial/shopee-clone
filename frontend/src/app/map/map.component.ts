import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() lat = 14.5995; // Manila coordinates by default
  @Input() lng = 120.9842;
  @Input() readOnly = false;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map!: L.Map;
  private marker!: L.Marker;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Standard Leaflet Icon setup from CDN to avoid build asset missing issues
    const defaultIcon = L.icon({
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    this.map = L.map('map-el', {
      center: [this.lat, this.lng],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = L.marker([this.lat, this.lng], {
      draggable: !this.readOnly,
    }).addTo(this.map);

    if (!this.readOnly) {
      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.locationSelected.emit({ lat: position.lat, lng: position.lng });
      });

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const coords = e.latlng;
        this.marker.setLatLng(coords);
        this.locationSelected.emit({ lat: coords.lat, lng: coords.lng });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
