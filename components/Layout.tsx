import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const Layout = React.memo(() => {
  const [_, setLayoutManager] = useState({})

  const [content, set_content] = useState(<S.LoadingContainer></S.LoadingContainer>)

  useEffect(() => {
    (async () => {
      const { GoldenLayoutComponent } = await import('@annotationhub/react-golden-layout')
      set_content(
        <GoldenLayoutComponent
          config={{
            settings: {
              showPopoutIcon: false,
              showMaximiseIcon: false,
              showCloseIcon: false,
              hasHeaders: true,
            },
            content: [
              {
                type: 'column',
                content: [
                 
                  {
                    type: 'row',
                    content: [
                      {
                        type: 'stack',
                        content: [
                          {
                            component: () => (<div>test</div>),
                            title: 'HTML'
                          },
                          {
                            component: () => (
                              <div>test</div>
                            ),
                            title: 'CSS'
                          },
                          {
                            component: () => (
                              <div>test</div>
                            ),
                            title: 'JS'
                          },
                        ]
                      },
                    
                    ]
                  },
                  {
                    type: 'row',
                    content: [
                      {
                        type: 'stack',
                        content: [
                          {
                            component: () => (
                              <div>test</div>
                            ),
                            title: 'Result'
                          },
                          {
                            component: () => (
                              <div>test</div>
                            ),
                            title: 'Console'
                          },
                        ]
                      }
                    ]
                  },
                ]
              }
            ]
          }}
          autoresize={true}
          debounceResize={100}
          onLayoutReady={setLayoutManager}
        />
      )
    })()
  }, [])

  return (
    <S.DockingContainer>
      {content}
    </S.DockingContainer>
  );
})

export default Layout

const S = {
  DockingContainer: styled.div`
    width: 100%;
    height: calc(100vh - var(--Header_Height));
    overflow: hidden;
    position: relative;
  `,
  LoadingContainer: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `
}
