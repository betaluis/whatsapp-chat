// Next
import { useRouter } from 'next/router';

// Styles
import styled from 'styled-components';
import * as EmailValidator from 'email-validator';

// Icons
import { Avatar, Button, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

// Firebase
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';

// Components
import Chat from '../components/Chat';

const Sidebar = () => {

    const [user] = useAuthState(auth);
    // Chats collection
    const chatsCollection = collection(db, 'chats'); // Get a reference to the "chats" collection.
    const chatsQuery = query(chatsCollection, where("users", "array-contains", user.email)); // Query the chats collection and check if the data inside of it, which is an array called users, contains the user email.
    const [chatsSnapshot] = useCollection(chatsQuery);

    // Router
    const router = useRouter();


    const createChat = async () => {
        const input = prompt('Please enter an email address for the user you with to chat with')
        if (!input) return null;

        // Does the chat exist?
        const chatAlreadyExists = (recipientEmail) => !!chatsSnapshot?.docs.find(chat => chat.data().users.find(user => user === recipientEmail)?.length > 0);

        // Is the email valid?
        if (EmailValidator.validate(input) && !chatAlreadyExists(input) && input !== user.email) {
            // This is where we need to add the chat into the database collection.
            // To continue we need to have login functionalities set up.
            await setDoc(doc(chatsCollection), {
                users: [
                    user.email,
                    input
                ],
            }, {merge: true});
        } 

        // Open the chat that was just created
        const createdChatQuery = query(chatsCollection, where("users", "array-contains", input))
        const createdChatSnapshot = await getDocs(createdChatQuery);

        const createdChatId = createdChatSnapshot?.docs?.[0]?.id;

        router.push(`/chat/${createdChatId}`)
    }

    
    return ( 
        <Container>
            <Header>
                <UserAvatar src={user?.photoURL} onClick={() => signOut(auth)} />
                <IconsContainer>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                </IconsContainer>
            </Header>
            <Search>
                <SearchIcon />
                <SearchInput placeholder="Search in chats" />
            </Search>
            <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

            {/* List of Chats */}
            {
                chatsSnapshot?.docs.map(chat => (
                    <Chat key={chat.id} id={chat.id} users={chat.data().users} />
                ))
            }



        </Container>
     );
}
 
export default Sidebar;

const Container = styled.div`
    flex: 0.45;
    border-right: 1px solid whitesmoke;
    height: 100vh;
    min-width: 300px;
    max-width: 350px;
    overflow-y: scroll;

    ::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const Header = styled.div`
    display: flex;
    position: sticky;
    top: 0;
    left: 0;
    background-color: white;
    z-index: 1;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    height: 80px;
    border-bottom: 1px solid whitesmoke;
`;
const UserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }
`;

const IconsContainer = styled.div`
    
`;

const Search =styled.div`
   display: flex; 
   align-items: center;
   padding: 20px;
   border-radius: 2px;
`;

const SearchInput = styled.input`
    outline-width: 0;
    border: none;
    flex: 1;
`;

const SidebarButton = styled(Button)`
    width: 100%;
    &&& {
        border-top: 1px solid whitesmoke;
        border-bottom: 1px solid whitesmoke;
        color: black;
    }
`;