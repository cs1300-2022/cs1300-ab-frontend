import React, { Component } from "react";
import axios from "axios";
import Logo from "./assets/logo.svg";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const menu = [
  {
    header: "Pastries",
    items: [
      {
        name: "BBQ Pork Bun",
        description: "Pork-filled buns with our signature five-spice blend",
        image: "./images/cs_porkbun.jpg",
        price: "6.00",
      },
      {
        name: "Egg Custard Bun",
        description: "Soft egg-filled milk and sugar buns",
        image: "./images/cs_eggcustard.jpg",
        price: "4.00",
      },
      {
        name: "Pineapple Bun",
        description: "Sweet milk and sugar buns",
        image: "./images/cs_pineapple.jpg",
        price: "5.00",
      },
      {
        name: "Sweetheart Cake",
        description: "Sesame buns with butter, egg, and milk",
        image: "./images/cs_sesame.jpg",
        price: "8.00",
      },
    ],
  },
  {
    header: "Drinks",
    items: [
      {
        name: "Vietnamese Coffee",
        description: "Coffee, sweetened condensed milk",
        image: "./images/cs_vietcoffee.jpg",
        price: "3.00",
      },
      {
        name: "Thai Ice Tea",
        description: "Sweetened condensed milk, evaporated milk, black tea",
        image: "./images/cs_thaitea.jpg",
        price: "3.00",
      },
      {
        name: "Chè Thái",
        description: "Jackfruit, lychee, longan, ai-yu jelly, coconut milk",
        image: "./images/cs_chethai.jpg",
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

const versions = ["a", "b"];
export class App extends Component {
  constructor() {
    super();
    this.state = {
      telemetry_data: {
        uid: null,
        version: null,
        data: {
          cart: {},
          cart_total: 0,
          actions: [],
        },
      },
      telemetry_online: null,
    };
  }

  componentDidMount() {
    axios
      .get(`http://localhost:3001`)
      .then((res) => {
        const data = res.data;
        if (data === "CS 1300 - User Interfaces and User Experiences") {
          this.setState({
            telemetry_online: true,
          });
        } else {
          this.setState({
            telemetry_online: false,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          telemetry_online: false,
        });
      });

    let telemetry_cookies = cookies.get("telemetry_data");
    if (telemetry_cookies) {
      console.log(this.state);
      this.setState(
        {
          telemetry_data: telemetry_cookies,
        },
        () => {
          this.addAction("page_load");
        }
      );
      console.log(this.state);
    } else {
      this.setState(
        {
          telemetry_data: {
            ...this.state.telemetry_data,
            uid: this.generateUID(),
            version: versions[Math.floor(Math.random() * versions.length)],
          },
        },
        () => {
          this.saveCookies();
          this.addAction("page_load");
        }
      );
    }
  }

  updateCart = (sectionid, itemid, delta) => {
    let key = `${sectionid}-${itemid}`;
    let cart = this.state.telemetry_data.data.cart;
    if (cart[key]) {
      cart[key] += delta;
    } else {
      cart[key] = delta;
    }

    if (cart[key] <= 0) {
      delete cart[key];
    }

    let cart_total = 0;
    for (let key in cart) {
      // get item price
      let ids = key.split("-");
      let price = this.getItemPrice(ids[0], ids[1]);
      cart_total += price * cart[key];
    }

    this.setState(
      {
        telemetry_data: {
          ...this.state.telemetry_data,
          data: {
            ...this.state.telemetry_data.data,
            cart: cart,
            cart_total: cart_total,
          },
        },
      },
      () => {
        this.addAction("update_cart");
      }
    );
  };

  sendTelemetry = () => {
    axios
      .post(`http://localhost:3001`, this.state.telemetry_data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getItemPrice = (sectionid, itemid) => {
    let item = menu[sectionid].items[itemid];
    return item.price;
  };

  addAction = (action) => {
    return new Promise((resolve) => this.setState(
      {
        telemetry_data: {
          ...this.state.telemetry_data,
          data: {
            ...this.state.telemetry_data.data,
            actions: [
              ...this.state.telemetry_data.data.actions,
              { timestamp: Date.now(), action: action },
            ],
          },
        },
      },
      () => {
        this.saveCookies();
        this.sendTelemetry();
        resolve();
      }
    ));
    
  };

  generateUID = () => {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(8);
  };

  saveCookies = () => {
    cookies.set("telemetry_data", this.state.telemetry_data);
  };

  checkout = () => {
    this.addAction("checkout").then(() => {
      // clear cookies
      console.log("checkout")
      cookies.remove("telemetry_data");
    });
  }

  render() {
    return (
      <div className="flex">
        <div className="flex self-start top-0 flex-col w-64 flex-none bg-black h-screen sticky">
          <img src={Logo} alt="logo" className="w-full p-6" />
          <div className="flex flex-1 flex-col p-8 text-white font-medium">
            <div className="my-2">Our Story</div>
            <div className="my-2">Order Online</div>
            <div className="my-2">Contact</div>
          </div>
          <div className="p-4 text-gray-400 text-xs text-center">{`UID: ${this.state.telemetry_data.uid}, Version: ${this.state.telemetry_data.version}`}</div>
          <div className="p-4 flex">
            {this.state.telemetry_online ? (
              <div className="flex items-center bg-green-500 bg-opacity-25 text-green-500 text-xs font-medium rounded-full px-2 py-1">
                Telemetry Online
                <div className="h-2 w-2 rounded-full ml-[0.375rem] bg-green-500 animate-pulse"></div>
              </div>
            ) : this.state.telemetry_online === null ? (
              <div className="flex items-center bg-blue-500 bg-opacity-25 text-sky-500 text-xs font-medium rounded-full px-2 py-1">
                Connecting...
                <div className="h-2 w-2 rounded-full ml-[0.375rem] bg-blue-500 animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center bg-red-500 bg-opacity-25 text-red-500 text-xs font-medium rounded-full px-2 py-1">
                Telemetry Offline / Error
                <div className="h-2 w-2 rounded-full ml-[0.375rem] bg-red-500 animate-pulse"></div>
              </div>
            )}
            <div className="flex-1"></div>
            <button
              className="px-2 py-1 text-xs text-red-500 bg-opacity-25 rounded-full bg-red-500 ml-2"
              onClick={() => cookies.remove("telemetry_data")}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="flex flex-1 bg-gray-200 py-16">
          <div className="px-36 min-h-screen bg-gray-200 max-w-6xl">
            <h1 className="font-bold text-5xl">Shop</h1>
            {menu.map((item, i) => (
              <div key={`card-${i}`}>
                <h2 className="font-medium text-4xl mt-12 mb-8">
                  {item.header}
                </h2>

                <div className="grid grid-cols-2 grid-flow-row gap-4">
                  {item.items.map((item, j) => (
                    <div
                      className="flex bg-white rounded-md drop-shadow transition-all duration-100 group hover:bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={() => this.updateCart(i, j, 1)}
                      key={`card-${i}-${j}`}
                    >
                      <div className="flex flex-col flex-1 px-4 py-2">
                        <h3 className="font-bold my-2 text-xl">{item.name}</h3>
                        <p className="flex-1 text-gray-700">
                          {item.description}
                        </p>
                        <div className="flex items-end">
                          <p className="flex-1 text-gray-900 font-medium mt-2">
                            ${item.price}
                          </p>
                          <div className="flex justify-center items-center">
                            <svg
                              className="h-6 w-6 text-gray-400 group-hover:text-[#c75260] transition-all duration-100"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M11 9H13V6H16V4H13V1H11V4H8V6H11M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18M17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18M7.2 14.8V14.7L8.1 13H15.5C16.2 13 16.9 12.6 17.2 12L21.1 5L19.4 4L15.5 11H8.5L4.3 2H1V4H3L6.6 11.6L5.2 14C5.1 14.3 5 14.6 5 15C5 16.1 5.9 17 7 17H19V15H7.4C7.3 15 7.2 14.9 7.2 14.8Z"
                              />
                            </svg>
                          </div>
                        </div>
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
          <div className="self-start sticky top-0">
            <p className="font-bold text-5xl">&nbsp;</p>
            <p className="font-medium text-4xl mt-12 mb-8">&nbsp;</p>
            <div className="flex flex-col w-96">
              <div className="bg-gray-900 text-white font-medium text-center p-4">
                Shopping Cart
              </div>
              <div className="p-8 bg-white h-[28rem] overflow-y-auto">
                <div className="flex flex-col">
                  {Object.keys(this.state.telemetry_data.data.cart).length ===
                  0 ? (
                    <div className="py-2 text-center">Your cart's empty.</div>
                  ) : null}
                  {Object.keys(this.state.telemetry_data.data.cart).map(
                    (key) => {
                      let [sectionid, itemid] = key.split("-");
                      let item = menu[sectionid].items[itemid];
                      return (
                        <div className="flex flex-col mb-2" key={`cart-${key}`}>
                          <div className="flex flex-row flex-1 py-2">
                            <p className="font-bold flex-1">{item.name}</p>
                            <p className="text-gray-900 font-medium">
                              {`$${item.price} x ${this.state.telemetry_data.data.cart[key]}`}
                            </p>
                          </div>
                          <div className="h-8 w-24 flex items-center">
                            <div className="w-full text-gray-700 text-sm font-semibold">
                              Quantity:
                            </div>
                            <div className="flex flex-row h-8 w-full rounded-lg relative bg-transparent ml-4">
                              <button
                                className=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                                onClick={() =>
                                  this.updateCart(sectionid, itemid, -1)
                                }
                              >
                                <span className="m-auto text-2xl font-light">
                                  −
                                </span>
                              </button>
                              <div className="outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black text-gray-700 leading-[2rem]">
                                {this.state.telemetry_data.data.cart[key]}
                              </div>
                              <button
                                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
                                onClick={() =>
                                  this.updateCart(sectionid, itemid, 1)
                                }
                              >
                                <span className="m-auto text-2xl font-light">
                                  +
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="p-8 bg-white">
                {/* Cumulative cart total */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex-1 text-gray-900 font-medium">
                    Order Total:
                  </div>
                  <div className="flex-1 text-right text-gray-900 font-medium">
                    {`$${this.state.telemetry_data.data.cart_total}`}
                  </div>
                </div>
                <button
                  className="bg-black text-white font-medium py-3 w-full hover:bg-gray-800 transition-all duration-75"
                  onClick={() => this.checkout()}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
