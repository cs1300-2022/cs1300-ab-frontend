import React, { Component } from "react";

import Logo from "./assets/logo.svg";

const menu = [
  {
    header: "Pastries",
    items: [
      {
        name: "BBQ Pork Bun",
        description: "Pork-filled buns with our signature five-spice blend",
        image: "",
        price: "6.00",
      },
      {
        name: "Egg Custard Bun",
        description: "Soft egg-filled milk and sugar buns",
        image: "./images/cake.jpg",
        price: "4.00",
      },
      {
        name: "Pineapple Bun",
        description: "Sweet milk and sugar buns",
        image: "",
        price: "5.00",
      },
      {
        name: "Sweetheart Cake",
        description: "Sesame buns with butter, egg, and milk",
        image: "",
        price: "8.00",
      },
    ],
  },
  {
    header: "Drinks",
    items: [
      {
        name: "Coffee",
        description: "Our signature blend",
        image: "",
        price: "3.00",
      },
      {
        name: "Tea",
        description: "Fresh from Compton",
        image: "",
        price: "3.00",
      },
      {
        name: "Juice",
        description: "Try our hand-pressed juices",
        image: "",
        price: "2.50",
      },
      {
        name: "Milk",
        description: "From our local Rhode Island farmers",
        image: "",
        price: "1.50",
      },
    ],
  },
];

export class App extends Component {
  render() {
    return (
      <div className="flex">
        <div className="w-64 flex-none bg-black min-h-screen">
          <img src={Logo} alt="logo" className="w-full p-6" />
        </div>
        <div className="flex flex-1 bg-gray-200">
          <div className="px-36 pt-24 min-h-screen bg-gray-200 max-w-6xl">
            <h1 className="font-bold text-5xl">Shop</h1>
            {menu.map((item) => (
              <div>
                <h2 className="font-medium text-4xl mt-16 mb-8">
                  {item.header}
                </h2>

                <div className="grid grid-cols-2 grid-flow-row gap-4">
                  {item.items.map((item) => (
                    <div className="flex bg-white rounded-md drop-shadow transition-all duration-75 hover:bg-gray-50 cursor-pointer overflow-hidden">
                      <div className="flex flex-col flex-1 px-4 py-2">
                        <h3 className="font-bold my-2 text-xl">{item.name}</h3>
                        <p className="flex-1 text-gray-700">
                          {item.description}
                        </p>
                        <p className="text-gray-900 font-medium mt-2">
                          ${item.price}
                        </p>
                      </div>
                      {item.image ? (
                        <div
                          className="w-32 h-40 flex-none bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image})` }}
                        ></div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-24">
            <p className="font-bold text-5xl">&nbsp;</p>
            <p className="font-medium text-4xl mt-16 mb-8">&nbsp;</p>
            <div className="flex flex-col w-96">
              <div className="bg-gray-900 text-white font-medium text-center p-4">
                Shopping Cart
              </div>
              <div className="p-8 bg-white h-[36rem]">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
