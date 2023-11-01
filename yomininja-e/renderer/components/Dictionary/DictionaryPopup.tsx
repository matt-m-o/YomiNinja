import { CSSProperties, useEffect } from "react";
import { DictionaryHeadword } from "../../../electron-src/@core/domain/dictionary/dictionary_headword/dictionary_headword"
import { Box, Divider, Typography, debounce, styled } from "@mui/material";
import Headword from "./PopupHeadword";



const Main = styled('div')({
    backgroundColor: 'black',
    color: 'white',
    position: 'absolute',
    width: '500px',
    height: '200px',
    overflow: 'scroll',    
    overflowX: 'hidden',
});


const Header = styled( Box )({

});

const DefinitionsUl = styled( 'ul' )({    
});



export interface DictionaryPopupProps {
    headwords: DictionaryHeadword[];
    targetElement?: JSX.Element;
    style?: CSSProperties;        
}


export default function DictionaryPopup( props: DictionaryPopupProps ) {

    const {
        headwords,
        targetElement,
        style,
    } = props;    


    const content = headwords.sort( ( a, b ) => b.term.length - a.term.length )
        .map( ( headword, idxH ) => {

            const { term, reading, furigana } = headword;

            const showDivider = idxH < headword.definitions.length -1;
            const definitionNumberVisibility = headword.definitions.length > 1 ? 'visible' : 'hidden';            

            return (
                <div key={idxH}>                    

                    <Header style={{ width: 'max-content' }}>
                        <Headword word={ term } furi={ furigana } />
                    </Header>

                    <ul style={{ paddingLeft: '1em' }}>
                        { headword.definitions.map( ( definition, idxD ) => {                    

                            return ( <li style={{ display: 'flex', marginBottom: '15px' }}>

                                <Box display='flex'>
                                    <Typography color='GrayText'
                                        visibility={definitionNumberVisibility}
                                        fontSize='1.2rem'
                                    >
                                        {idxD+1}.
                                    </Typography>
                                    {/* { definition.tags.map( tag => {
                                        return <Typography>{tag.name}</Typography>
                                    }) } */}
                                </Box>                                

                                <DefinitionsUl key={idxD}>
                                    
                                    { definition.definitions.map( ( text, idxDItem ) => {
                                        return (
                                            <li key={idxDItem}>
                                                <Typography fontSize='1.2rem' >
                                                    {text}
                                                </Typography> 
                                            </li>
                                        )                                        
                                    }) }
                                </DefinitionsUl>                        
                            </li> )

                        }) }
                    </ul>

                    
                    { showDivider &&
                        <Divider variant="middle" />
                    }
                </div>
            )
        }
    );


    return (
        <Main id='dictionary-popup' style={style} >
            { content }
        </Main>
    )    
}
  