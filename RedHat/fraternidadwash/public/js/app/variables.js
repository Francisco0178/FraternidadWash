
////////////////////////////////////////////////////////////
// - - - - - - - - - - - VARIABLES - - - - - - - - - - - //
//////////////////////////////////////////////////////////

var currentSection = "documents";

var currentProfileSection = new String();

var currentChatID;

//Var de Jose
var currentUser = {};

//Variables globales
var modal, user, users, publications, rightBar, topBar, middleBar, win, doc, chatWindow, chat, chatObj, photoInput, _profileImageCont, publication, prefabs, miniImage, _sections, _followOptions, _profileImage, _fullName, _newPost, _career, _age, _msg, _followers, _following, _askpass, pubDropdown, _usersList, userCard, contact, chatMessage, chatMesagges,comment;

//Variables en caché
var cachedImages, cachedPublications, cachedUsers, cachedChats, cachedComments;

//Elementos que actualizan su tiempo
var timeElements = new Array();
var imgurError = false;
var io;
