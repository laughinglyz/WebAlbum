import React from 'react';
import './App.css';
import $ from 'jquery';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      showimagelist: false,
      showimage: false,
      loginfailure: false,
      albumchosen: '',
      newusername: '',
      newuserpw: '',
      selfusername: '',
      selfuserid: '',
      friends: [],
      images: [],
      newliker: '',
    };
    this.loadpage = this.loadpage.bind(this);
    this.setnewuserpw = this.setnewuserpw.bind(this);
    this.setnewusername = this.setnewusername.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.showlist = this.showlist.bind(this);
    this.deletephoto = this.deletephoto.bind(this);
    this.likephoto = this.likephoto.bind(this);
    this.changelist = this.changelist.bind(this);
    this.uploadphoto = this.uploadphoto.bind(this);
  }

  componentDidMount() {
    this.loadpage();
  }

  loadpage() {
    $.ajax({
      url: "http://localhost:3002/init",
      method: 'GET',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        if (data !== '') {
          this.setState({
            loggedin: true,
            selfusername: data['selfusername'],
            selfuserid: data['selfid'],
            friends: data['friends']
          });
        }
      }.bind(this),
    });
  }

  setnewusername(ev) {
    this.setState({
      newusername: ev.target.value
    })
  }

  setnewuserpw(ev) {
    this.setState({
      newuserpw: ev.target.value
    })
  }

  login(e) {
    e.preventDefault();
    if (this.state.newusername === '' || this.state.newuserpw === '') {
      alert("You must enter username and password");
    } else {
      $.ajax({
        method: 'POST',
        url: "http://localhost:3002/login",
        data: {
          userName: this.state.newusername,
          password: this.state.newuserpw
        },
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        success: function (data) {
          if (data === "Login failure") {
            this.setState({
              loginfailure: true
            })
          } else {
            this.setState({
              loggedin: true,
              loginfailure: false,
              selfusername: data['selfusername'],
              selfuserid: data['selfid'],
              friends: data['friends'],
              albumchosen: '',
            })
          }
        }.bind(this)
      })
    }
  }

  logout() {
    $.ajax({
      url: "http://localhost:3002/logout",
      method: 'GET',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        this.setState({
          loggedin: false,
          showimagelist: false,
          showimage: false,
          loginfailure: false,
          newusername: '',
          newuserpw: '',
          selfusername: '',
          selfuserid: '',
          friends: [],
          images: [],
          albumchosen: '',
        })
      }.bind(this)
    })
  }

  deletephoto(id) {
    var confirmation = window.confirm('Are you sure you want to delete this photo?');
    if (confirmation === true) {
      $.ajax({
        url: "http://localhost:3002/deletephoto/" + id,
        method: 'DELETE',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        success: function (data) {
          this.showlist(this.state.albumchosen, false);
        }.bind(this),
        error: function (xhr, ajaxOptions, thrownError) {
          alert(thrownError);
        }
      })
    }
  }

  likephoto(id, large) {
    $.ajax({
      url: "http://localhost:3002/updatelike/" + id,
      method: 'PUT',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        this.showlist(this.state.albumchosen, large);
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
        alert(thrownError);
      }
    })
  }


  showlist(id, large) {
    $.ajax({
      url: "http://localhost:3002/getalbum/" + id,
      method: 'GET',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        if (large) {
          this.setState({
            images: data,
          })
        } else {
          this.setState({
            images: data,
            showimagelist: true,
            showimage: false,
            albumchosen: id
          })
        }
      }.bind(this),
    })
  }

  changelist() {
    this.setState({
      showimagelist: !this.state.showimagelist,
      showimage: !this.state.showimage
    })
  }

  uploadphoto(f) {
    $.ajax({
      url: "http://localhost:3002/uploadphoto/",
      method: 'POST',
      crossDomain: true,
      processData:false,
      data: f,
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        this.showlist(this.state.albumchosen, false);
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
        alert(thrownError);
      }
    })
  }

  render() {
    return (
      <div id="wraper">
        <div id="title"><h1>iAlbum</h1>
          {
            this.state.loginfailure &&
            <p>Login failure</p>
          }</div>
        {this.state.loggedin ?
          <div id="welcome"><span id="welcome1">Hello, {this.state.selfusername}!</span><button onClick={this.logout}>log out</button></div> :
          <div id="logginform"><form onSubmit={this.login}>
            username<input type="text" id="name" name="loginName" onChange={this.setnewusername}></input>
            password<input type="password" id="password" name="loginPassword" onChange={this.setnewuserpw}></input>
            <input type="submit"></input>
          </form></div>
        }
        <br></br>
        <Albumlist
          friends={this.state.friends}
          showlist={this.showlist}
          loggedin={this.state.loggedin}
          albumchosen={this.state.albumchosen}
        ></Albumlist>
        <Photolist
          images={this.state.images}
          showimagelist={this.state.showimagelist}
          showimage={this.state.showimage}
          albumchosen={this.state.albumchosen}
          likephoto={this.likephoto}
          deletephoto={this.deletephoto}
          changelist={this.changelist}
          uploadphoto={this.uploadphoto}
        ></Photolist>


      </div>
    );
  }

}

class Albumlist extends React.Component {
  constructor(props) {
    super(props);
    this.showlist = this.showlist.bind(this);
  }

  showlist(e) {
    e.preventDefault();
    this.props.showlist(e.target.rel, false);
  }

  render() {
    let rows = [];
    if (this.props.loggedin) {

      this.props.friends.map((friend) => {
        rows.push(
          <p><a rel={friend['friendsid']} href="" onClick={this.showlist} style={this.props.albumchosen === friend['friendsid'] ? { color: "gray" } : { color: "black" }}>{friend['friendname']}'s Album</a></p>
        );
      });
    }


    return (

      <div id="albumlist">
        {
          this.props.loggedin && <div>
            <p><a rel='0' href="" onClick={this.showlist} style={this.props.albumchosen === '0' ? { color: "gray" } : { color: "black" }}>My Album</a></p>
            {rows}
          </div>
        }
      </div>
    );
  }
}

class Photolist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgid: '',
      imgsrc: '',
      imglikedby: [],
      fileobj: null
    }
    this.deletephoto = this.deletephoto.bind(this);
    this.likephoto = this.likephoto.bind(this);
    this.enlargeimage = this.enlargeimage.bind(this);
    this.gobacktolist = this.gobacktolist.bind(this);
    this.uploadphoto = this.uploadphoto.bind(this);
    this.likelargephoto = this.likelargephoto.bind(this);
    this.setfile = this.setfile.bind(this);
  }

  enlargeimage(ev) {
    let id = ev.target.id;
    this.props.images.map((image) => {
      if (image['_id'] === id) {
        this.props.changelist();
        this.setState({
          imgid: id,
          imgsrc: image['url'],
          imglikedby: image['likedby']
        })
      }
    })
  }

  deletephoto(e) {
    this.props.deletephoto(e.target.parentNode.children[0].id)
    this.setState({
      imgid: '',
      imgsrc: '',
      imglikedby: []
    })
  }

  likephoto(e) {
    this.props.likephoto(e.target.parentNode.children[0].id, false)
  }

  gobacktolist() {
    this.props.changelist();
    this.setState({
      imgid: '',
      imgsrc: '',
      imglikedby: []
    })
  }

  uploadphoto() {
    if (this.state.fileobj !== null) {
      this.props.uploadphoto(this.state.fileobj);
    }

  }

  likelargephoto(e) {
    let id = e.target.parentNode.children[0].id;
    this.props.likephoto(id, true);
  }

  setfile(e) {
    this.setState({
      fileobj: e.target.files[0]
    })
  }

  render() {
    let rows = [];
    if (this.props.showimagelist && this.props.images.length > 0) {
      this.props.images.map((image) => {
        rows.push(
          <div className="col-1">
            <img src={image['url']} alt="" id={image['_id']} className="smallimg" onClick={this.enlargeimage}></img>
            <br></br>
            {this.props.albumchosen === '0' ?
              <button onClick={this.deletephoto} className="bt">Delete</button> : <button onClick={this.likephoto} className="bt">Like</button>
            }
            {image['likedby'].length > 0 && <div>{String(image['likedby'])} liked this photo!</div>}
          </div>
        );
      });
    }

    let imagechosen = null;
    if (this.state.imgid !== '') {
      if(this.props.images.length>0){
        this.props.images.map((image) => {
          if (image['_id'] === this.state.imgid)
            imagechosen = image;
        })
      }
    }

    return (

      <div id="photocanva">
        {this.props.showimagelist &&
          <div>{rows}
            {this.props.albumchosen === '0' &&
              <div id="uploadphoto"><input type="file" id="myFile" onChange={this.setfile}></input>
              <button onClick={this.uploadphoto}>Upload Photo</button></div>}
          </div>
        }
        {this.props.showimage &&
          <div id="canva">
            <img src={this.state.imgsrc} alt="" className="largeimg" id={this.state.imgid}></img>
            <button onClick={this.gobacktolist} id="leave">X</button>
            {imagechosen!==null&& imagechosen['likedby'].length > 0 && <div id="likers">{String(imagechosen['likedby'])} liked this photo!</div>}
            {this.props.albumchosen === '0' ?
              <button onClick={this.deletephoto} className="bt2">Delete</button> : <button onClick={this.likelargephoto} className="bt2">Like</button>
            }
          </div>}
      </div>
    )
  }
}
export default App;