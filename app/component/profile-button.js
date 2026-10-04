'use client'

import Image from "next/image"
import ProfileDark from "@/app/assets/profile-dark.svg"
import ProfileLight from "@/app/assets/profile-light.svg"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/app/context/theme-context"
import LoginButton from "@/app/component/login-button"


const ProfileButton = () => {
    const { isDark } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const profileRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [])


    return (
        <div className="profile-container" ref={profileRef}>
            <button className="profile" id="profileIcon" onClick={
                () => setIsOpen(!isOpen)}>
                <Image className='profile-img' src={isDark ? ProfileDark : ProfileLight} alt="Profile Icon" />
            </button>

            {isOpen && (
                <div className="profile-menu active" id="profileMenu">
                    <div className="profile-info">
                        <Image className='profile-img' src={isDark ? ProfileDark : ProfileLight} alt="Profile Icon" />
                        <h4>Raisya Saputra</h4>
                    </div>
                    <hr />
                    <button className="profile-link">Setting</button>
                    <LoginButton />
                    

                </div>
            )}

        </div >
    )
}

export default ProfileButton