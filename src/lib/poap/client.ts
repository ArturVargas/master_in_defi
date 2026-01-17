/**
 * Cliente POAP SDK
 * Adaptado desde /Users/mac03/web3/poapsdk/poap-quiz-app/lib/poap-client.ts
 */

import {
  PoapCompass,
  PoapMomentsApi,
  AuthenticationProviderHttp,
} from '@poap-xyz/poap-sdk'
import { config } from '@/lib/config'
import type { POAPReserveResult } from '@/types/poap'

export class PoapClient {
  private compass: PoapCompass
  private momentsApi: PoapMomentsApi
  private apiKey: string
  private clientId: string
  private clientSecret: string
  private authProvider: AuthenticationProviderHttp

  constructor(apiKey: string, clientId: string, clientSecret: string) {
    this.apiKey = apiKey
    this.clientId = clientId
    this.clientSecret = clientSecret

    // Initialize authentication provider
    this.authProvider = new AuthenticationProviderHttp(clientId, clientSecret)

    // Initialize POAP Compass (for drops and minting)
    // Note: PoapCompass may only accept apiKey in newer versions
    this.compass = new PoapCompass({
      apiKey,
    })

    // Initialize Moments API
    // PoapMomentsApi accepts authenticationProvider, not apiKey
    this.momentsApi = new PoapMomentsApi({
      authenticationProvider: this.authProvider,
    })
  }

  /**
   * Get OAuth2 access token for authenticated requests
   * Makes direct OAuth2 request to POAP API
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Since AuthenticationProviderHttp doesn't expose getAccessToken(),
      // we need to make the OAuth2 request directly
      const response = await fetch('https://api.poap.tech/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      })

      if (!response.ok) {
        throw new Error(`OAuth2 token request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Failed to get access token:', error)
      throw new Error('Authentication failed')
    }
  }

  async createDrop(dropData: {
    name: string
    description: string
    city: string
    country: string
    startDate: Date
    endDate: Date
    expiryDate: Date
    eventUrl: string
    virtualEvent: boolean
    privateEvent: boolean
    secretCode: string
    email: string
    requestedCodes: number
    image?: File | Blob
    filename?: string
  }) {
    try {
      console.log('Creating drop with POAP API:', { ...dropData, image: 'File Object' })

      // Use POAP REST API directly
      const formData = new FormData()

      // Helper function to format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // Add all fields to FormData
      formData.append('name', dropData.name)
      formData.append('description', dropData.description)
      formData.append('city', dropData.city)
      formData.append('country', dropData.country)
      formData.append('start_date', formatDate(dropData.startDate))
      formData.append('end_date', formatDate(dropData.endDate))
      formData.append('expiry_date', formatDate(dropData.expiryDate))
      formData.append('year', dropData.startDate.getFullYear().toString())
      formData.append('event_url', dropData.eventUrl)
      formData.append('virtual_event', dropData.virtualEvent.toString())
      formData.append('private_event', dropData.privateEvent.toString())
      formData.append('secret_code', dropData.secretCode)
      formData.append('event_template_id', '0')
      formData.append('email', dropData.email)
      formData.append('requested_codes', dropData.requestedCodes.toString())

      // Add image file
      if (dropData.image) {
        formData.append('image', dropData.image, dropData.filename)
      }

      const response = await fetch('https://api.poap.tech/events', {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('POAP API error response:', errorData)
        throw new Error(`POAP API error: ${response.status} - ${errorData}`)
      }

      const drop = await response.json()
      console.log('Drop created successfully:', drop)
      return drop
    } catch (error) {
      console.error('Error creating drop:', error)
      throw new Error(`Failed to create drop: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async reservePoapForEmail(
    eventId: number,
    email: string,
    secretCode: string
  ): Promise<POAPReserveResult> {
    try {
      console.log(`[POAP Client] Reserving POAP for event ${eventId} to ${email}`)

      // Get OAuth2 access token
      console.log('[POAP Client] Step 0: Getting OAuth2 access token...')
      const accessToken = await this.getAccessToken()
      console.log('[POAP Client] ✅ Access token obtained')

      // Step 1: Get available QR codes from the event
      console.log('[POAP Client] Step 1: Fetching available QR codes...')
      const qrCodesResponse = await fetch(`https://api.poap.tech/event/${eventId}/qr-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_code: secretCode,
        }),
      })

      if (!qrCodesResponse.ok) {
        const errorText = await qrCodesResponse.text()
        console.error('[POAP Client] Failed to fetch QR codes:', errorText)
        throw new Error(`Failed to fetch QR codes: ${qrCodesResponse.status} - ${errorText}`)
      }

      const qrCodes: Array<{ qr_hash: string; claimed: boolean }> = await qrCodesResponse.json()
      console.log(`[POAP Client] Retrieved ${qrCodes.length} QR codes`)

      // Step 2: Find an unclaimed QR code
      const availableCode = qrCodes.find(code => !code.claimed)
      if (!availableCode) {
        throw new Error('No unclaimed POAP codes available for this event')
      }

      console.log('[POAP Client] Step 2: Found unclaimed code:', availableCode.qr_hash)

      // Step 3: Claim the QR code for the user
      console.log('[POAP Client] Step 3: Claiming POAP for user...')
      const claimResponse = await fetch('https://api.poap.tech/actions/claim-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: email,
          qr_hash: availableCode.qr_hash,
          secret: secretCode,
          sendEmail: true,
        }),
      })

      if (!claimResponse.ok) {
        const errorText = await claimResponse.text()
        console.error('[POAP Client] Failed to claim POAP:', errorText)
        throw new Error(`Failed to claim POAP: ${claimResponse.status} - ${errorText}`)
      }

      const claimResult = await claimResponse.json()
      console.log('[POAP Client] ✅ POAP claimed successfully:', claimResult)

      return {
        claimCode: availableCode.qr_hash,
        claimUrl: `https://poap.xyz/claim/${availableCode.qr_hash}`,
        result: claimResult,
      }
    } catch (error) {
      console.error('[POAP Client] ❌ Error reserving POAP:', error)
      throw new Error(`Failed to reserve POAP: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async mintPoap(eventId: number, address: string, email?: string) {
    try {
      console.log(`Minting POAP for event ${eventId} to ${address}`)

      // Use REST API directly since PoapCompass doesn't have mintToken method
      const accessToken = await this.getAccessToken()
      const response = await fetch('https://api.poap.tech/actions/mint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          address,
          email,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to mint POAP: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('POAP minted successfully:', result)
      return result
    } catch (error) {
      console.error('Error minting POAP:', error)
      throw new Error(`Failed to mint POAP: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getDropInfo(eventId: number) {
    try {
      console.log(`Getting drop info for event ${eventId}`)
      // Use REST API directly
      const response = await fetch(`https://api.poap.tech/events/id/${eventId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get drop info: ${response.status} - ${errorText}`)
      }

      const drop = await response.json()
      console.log('Drop info retrieved:', drop)
      return drop
    } catch (error) {
      console.error('Error getting drop info:', error)
      throw new Error(`Failed to get drop info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getEventByFancyId(fancyId: string) {
    try {
      console.log(`Getting event by fancy ID: ${fancyId}`)
      // Use REST API directly
      const response = await fetch(`https://api.poap.tech/events/${fancyId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get event: ${response.status} - ${errorText}`)
      }

      const event = await response.json()
      console.log('Event retrieved:', event)
      return event
    } catch (error) {
      console.error('Error getting event by fancy ID:', error)
      throw new Error(`Failed to get event: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getQRCode(qrHash: string) {
    try {
      console.log(`Getting QR code for: ${qrHash}`)
      // Use REST API directly
      const accessToken = await this.getAccessToken()
      const response = await fetch(`https://api.poap.tech/qr/${qrHash}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.apiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get QR code: ${response.status} - ${errorText}`)
      }

      const qrCode = await response.json()
      console.log('QR code retrieved:', qrCode)
      return qrCode
    } catch (error) {
      console.error('Error getting QR code:', error)
      throw new Error(`Failed to get QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Singleton instance
let poapClient: PoapClient | null = null

export function getPoapClient(): PoapClient {
  if (!poapClient) {
    const apiKey = config.poap.apiKey
    const clientId = config.poap.clientId
    const clientSecret = config.poap.clientSecret

    if (!apiKey) {
      throw new Error('POAP_API_KEY not configured in environment variables')
    }

    if (!clientId || !clientSecret) {
      throw new Error('POAP_CLIENT_ID and POAP_CLIENT_SECRET must be configured')
    }

    poapClient = new PoapClient(apiKey, clientId, clientSecret)
  }
  return poapClient
}
