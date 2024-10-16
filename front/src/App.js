import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Map from './components/Map';
import ProductList from './components/ProductList';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <SearchBar />
        <div className="content">
          <Map />
          <ProductList />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;