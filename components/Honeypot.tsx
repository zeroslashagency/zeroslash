import { forwardRef } from "react"

/**
 * Spam trap for the form proxy routes. Humans never see or fill this field;
 * naive bots fill every input. The API routes treat a non-empty `website`
 * value as a bot and answer `ok` without forwarding (see lib/api.ts isBot).
 *
 * Hidden off-screen rather than display:none, since some bots skip
 * display:none fields. aria-hidden and tabIndex -1 keep it out of the
 * accessibility tree and the tab order.
 */
const Honeypot = forwardRef<HTMLInputElement>(function Honeypot(_props, ref) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label htmlFor="hp-website">Website</label>
      <input ref={ref} id="hp-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
})

export default Honeypot
