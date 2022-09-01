import React, { Component } from "react";
import axios from "axios";
import Logo from "./assets/logo.svg";
import Cookies from "universal-cookie";
import toast, { Toaster } from "react-hot-toast";

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
        name: "Soy Milk",
        description: "Creamy and smooth soy milk",
        image: "./images/cs_soymilk.jpg",
        price: "1.50",
      },
    ],
  },
];

const versions = ["a", "b"];

const TelemetryStatus = {
  ONLINE: {
    name: "Telemetry Online",
    bg_color: "bg-green-500",
    text_color: "text-green-500",
  },
  OFFLINE: {
    name: "Telemetry Offline",
    bg_color: "bg-red-500",
    text_color: "text-red-500",
  },
  ERROR: {
    name: "Telemetry Error",
    bg_color: "bg-orange-500",
    text_color: "text-orange-500",
  },
  CONNECTING: {
    name: "Telemetry Connecting",
    bg_color: "bg-blue-500",
    text_color: "text-sky-500",
  },
  SENDING: {
    name: "Telemetry Sending",
    bg_color: "bg-blue-500",
    text_color: "text-sky-500",
  },
};

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
      telemetry_status: TelemetryStatus.CONNECTING,
      cart_visible: false,
      modal_visible: false,
      complete: false,
    };
  }

  componentDidMount() {
    axios
      .get(`http://localhost:3001`)
      .then((res) => {
        const data = res.data;
        if (data === "CS 1300 - User Interfaces and User Experiences") {
          this.setState({
            telemetry_status: TelemetryStatus.ONLINE,
          });
        } else {
          this.setState({
            telemetry_status: TelemetryStatus.ERROR,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          telemetry_status: TelemetryStatus.OFFLINE,
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
    // setting to sending state makes the button flicker, and that's distracting
    // this.setTelemetryState(TelemetryStatus.SENDING);
    return new Promise((resolve, reject) =>
      axios
        .post(`http://localhost:3001`, this.state.telemetry_data)
        .then((res) => {
          if (res.status === 200) {
            this.setTelemetryState(TelemetryStatus.ONLINE);
            resolve(res);
          } else {
            this.setTelemetryState(TelemetryStatus.ERROR);
            reject(res);
          }
        })
        .catch((err) => {
          console.log(err);
          this.setTelemetryState(TelemetryStatus.ERROR);
          reject(err);
        })
    );
  };

  getItemPrice = (sectionid, itemid) => {
    let item = menu[sectionid].items[itemid];
    return item.price;
  };

  addAction = (action) => {
    return new Promise((resolve, reject) =>
      this.setState(
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
          this.sendTelemetry().then((res) => {
            reject(res);
          });
        }
      )
    );
  };

  generateUID = () => {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(8);
  };

  saveCookies = () => {
    cookies.set("telemetry_data", this.state.telemetry_data);
  };

  checkout = () => {
    this.addAction("checkout")
      .then((res) => {
        if (res.status === 200) {
          cookies.remove("telemetry_data");
          this.setState({
            complete: true,
          });
        }
      })
      .catch((err) => {
        this.setTelemetryState(TelemetryStatus.ERROR);
      });
  };

  toggleCartPopup = (to_on) => {
    if (to_on === undefined) {
      this.setState({
        cart_visible: !this.state.cart_visible,
      });
    } else if (to_on) {
      this.setState({
        cart_visible: true,
      });
    } else {
      this.setState({
        cart_visible: false,
      });
    }
  };

  toggleModal = (to_on) => {
    if (to_on === undefined) {
      this.setState({
        modal_visible: !this.state.modal_visible,
      });
    } else if (to_on) {
      this.setState({
        modal_visible: true,
      });
    } else {
      this.setState({
        modal_visible: false,
      });
    }
  };

  setModalContent = (id) => {
    this.setState({
      modal_content: id,
    });
  };

  setTelemetryState = (status) => {
    this.setState({
      telemetry_status: status,
    });
  };

  ShoppingCart = (props) => {
    return (
      <div className={"flex flex-col w-96 " + (props.fixedY ? "" : "h-full")}>
        <div className="flex bg-gray-900 text-white font-medium p-4 items-center">
          <div className="flex-1 text-center">Shopping Cart</div>
          <button
            className={
              this.state.telemetry_data.version === "a" ? "hidden" : ""
            }
            onClick={() => this.toggleCartPopup(false)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>
        <div
          className={
            "p-8 bg-white overflow-y-auto " +
            (props.fixedY ? "h-[28rem]" : "flex-1")
          }
        >
          <div className="flex flex-col">
            {Object.keys(this.state.telemetry_data.data.cart).length === 0 ? (
              <div className="py-2 text-center">Your cart's empty.</div>
            ) : null}
            {Object.keys(this.state.telemetry_data.data.cart).map((key) => {
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
                        onClick={() => this.updateCart(sectionid, itemid, -1)}
                      >
                        <span className="m-auto text-2xl font-light">−</span>
                      </button>
                      <div className="outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black text-gray-700 leading-[2rem]">
                        {this.state.telemetry_data.data.cart[key]}
                      </div>
                      <button
                        className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
                        onClick={() => this.updateCart(sectionid, itemid, 1)}
                      >
                        <span className="m-auto text-2xl font-light">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-8 bg-white">
          {/* Cumulative cart total */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 text-gray-900 font-medium">Order Total:</div>
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
    );
  };

  FixedElements = (props) => {
    return (
      <>
        {/* Shopping cart icon for version B */}
        <button
          className={
            "fixed flex items-center justify-center w-14 h-14 top-0 right-0 mr-8 mt-8 bg-black rounded-full hover:bg-gray-800 transition-all duration-100 " +
            (this.state.telemetry_data.version === "a" ? "hidden" : "")
          }
          onClick={() => this.toggleCartPopup(true)}
        >
          <div className="relative inline-block">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"
              />
            </svg>
            <span
              className={
                "absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full " +
                (Object.keys(this.state.telemetry_data.data.cart).length === 0
                  ? "hidden"
                  : "")
              }
            >
              {Object.keys(this.state.telemetry_data.data.cart).length > 0
                ? Object.values(this.state.telemetry_data.data.cart).reduce(
                    (a, b) => a + b
                  )
                : 0}
            </span>
          </div>
        </button>
        <div
          className={
            "fixed top-0 left-0 bottom-0 right-0 bg-black z-10 transition-all duration-200 " +
            (this.state.cart_visible || this.state.modal_visible
              ? "opacity-50"
              : "opacity-0 pointer-events-none")
          }
          onClick={() => {
            this.toggleCartPopup(false);
            this.toggleModal(false);
          }}
        ></div>
        <div
          className={
            "transform top-0 right-0 w-96 bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 " +
            (this.state.telemetry_data.version === "a" ? "hidden " : "") +
            (this.state.cart_visible ? "translate-x-0" : "translate-x-full")
          }
        >
          <this.ShoppingCart />
        </div>
      </>
    );
  };

  SideBar = (props) => {
    return (
      <div className="flex self-start top-0 flex-col w-64 flex-none bg-black h-screen sticky">
        <img src={Logo} alt="logo" className="w-full p-6" />
        <div className="flex flex-1 flex-col p-8 text-white font-medium">
          <div className="my-2">Our Story</div>
          <div className="my-2">Order Online</div>
          <div className="my-2">Contact</div>
        </div>
        <div className="p-4 text-gray-400 text-xs text-center">
          {`UID: ${this.state.telemetry_data.uid}, Version: `}
          <span className="uppercase">{this.state.telemetry_data.version}</span>
        </div>
        <div className="p-4 flex">
          <this.TelemetryIndicator status={this.state.telemetry_status} />
          <div className="flex-1"></div>
          <button
            className="px-2 py-1 text-xs text-red-500 bg-opacity-25 rounded-full bg-red-500 ml-2"
            onClick={() => {
              cookies.remove("telemetry_data");
              window.location.reload();
            }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  Shop = (props) => {
    return (
      <div className="flex flex-1 bg-gray-200 py-16">
        <div className="px-36 min-h-screen bg-gray-200 max-w-6xl">
          <h1 className="font-bold text-5xl">Shop</h1>
          {menu.map((item, i) => (
            <div key={`card-${i}`}>
              <h2 className="font-medium text-4xl mt-12 mb-8">{item.header}</h2>

              <div className="grid grid-cols-2 grid-flow-row gap-4">
                {item.items.map((item, j) => (
                  <div
                    className="flex bg-white rounded-md drop-shadow transition-all duration-100 group hover:bg-gray-100 cursor-pointer overflow-hidden"
                    onClick={() => this.updateCart(i, j, 1)}
                    key={`card-${i}-${j}`}
                  >
                    <div className="flex flex-col flex-1 px-4 py-2">
                      <h3 className="font-bold my-2 text-xl">{item.name}</h3>
                      <p className="flex-1 text-gray-700">{item.description}</p>
                      <div className="flex items-end">
                        <p className="flex-1 text-gray-900 font-medium mt-2">
                          ${item.price}
                        </p>
                        <div
                          className={
                            "flex justify-center items-center " +
                            (this.state.telemetry_data.version === "b"
                              ? "hidden"
                              : "")
                          }
                        >
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
        <div
          className={
            "self-start sticky top-0 " +
            (this.state.telemetry_data.version === "b" ? "hidden" : "")
          }
        >
          <p className="font-bold text-5xl">&nbsp;</p>
          <p className="font-medium text-4xl mt-12 mb-8">&nbsp;</p>
          <this.ShoppingCart fixedY={true} />
        </div>
      </div>
    );
  };

  Complete = (props) => {
    return (
      <div className="flex flex-col flex-1 bg-gray-200 py-16 text-center">
        <div className="mt-16 text-7xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Thank you!
          </span>{" "}
          🎉
        </div>
        <div className="max-w-5xl mx-auto text-lg my-4">
          Thanks for participating in this in-class activity! Your data has been
          successfully transmitted to our telemetry server. After class today,
          you will receive the data generated from this A/B test. If you would
          like to identify your data within the full dataset, write down your
          UID ({this.state.telemetry_data.uid}).
        </div>
        <div className="max-w-5xl mx-auto text-lg my-4">
          The statistical analysis portion of the week's assignment is an
          individual assignment and must be submitted separately by all
          students.
        </div>
        <div className="max-w-5xl mx-auto text-lg my-4">
          Please close this window and do not re-visit this webpage before class
          ends.
        </div>
      </div>
    );
  };

  TelemetryIndicator = (props) => {
    return (
      <div
        className={
          "flex items-center bg-opacity-25 text-xs font-medium rounded-full px-2 py-1 " +
          props.status.bg_color +
          " " +
          props.status.text_color
        }
      >
        {props.status.name}
        <div
          className={
            "h-2 w-2 rounded-full ml-[0.375rem] animate-pulse " +
            props.status.bg_color
          }
        ></div>
      </div>
    );
  };

  render() {
    if (this.state.modal_visible || this.state.cart_visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return (
      <>
        <Toaster />
        <div className="flex">
          <this.SideBar />
          {!this.state.complete ? (
            <>
              <this.FixedElements />
              <this.Shop />
            </>
          ) : (
            <this.Complete />
          )}
        </div>
      </>
    );
  }
}

export default App;
